/**
 * WebSocket Service - Handles real-time communication with the server
 */
class WebSocketService {
    constructor() {
        this.ws = null;
        this.url = ApiConfig.wsURL;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.pingInterval = null;
        this.isConnected = false;
        this.eventHandlers = new Map();
        this.messageQueue = [];
        this.subscriptions = new Set();
    }

    /**
     * Connect to WebSocket server
     */
    connect(token = null) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            try {
                // Add authentication token to URL if provided
                const wsUrl = token ? `${this.url}?token=${token}` : this.url;
                this.ws = new WebSocket(wsUrl);

                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;

                    // Send authentication if token provided
                    if (token) {
                        this.authenticate(token);
                    }

                    // Process queued messages
                    this.processMessageQueue();

                    // Start ping interval
                    this.startPingInterval();

                    // Restore subscriptions
                    this.restoreSubscriptions();

                    // Emit connected event
                    this.emit(ApiConfig.wsEvents.server.CONNECTED);
                    window.eventBus?.emit('websocket:connected');

                    resolve();
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(event);
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    window.eventBus?.emit('websocket:error', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.isConnected = false;
                    this.ws = null;

                    // Stop ping interval
                    this.stopPingInterval();

                    // Emit disconnected event
                    this.emit(ApiConfig.wsEvents.server.DISCONNECTED);
                    window.eventBus?.emit('websocket:disconnected');

                    // Attempt reconnection
                    this.attemptReconnect();
                };
            } catch (error) {
                console.error('WebSocket connection error:', error);
                reject(error);
            }
        });
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (this.ws) {
            this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
        this.stopPingInterval();
        this.eventHandlers.clear();
        this.subscriptions.clear();
        this.messageQueue = [];
    }

    /**
     * Send message to server
     */
    send(event, data = {}) {
        const message = {
            event,
            data,
            timestamp: Date.now(),
        };

        if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(message));
                return true;
            } catch (error) {
                console.error('Failed to send message:', error);
                this.queueMessage(message);
                return false;
            }
        } else {
            // Queue message if not connected
            this.queueMessage(message);
            return false;
        }
    }

    /**
     * Subscribe to an event
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event).add(handler);

        return () => this.off(event, handler); // Return unsubscribe function
    }

    /**
     * Unsubscribe from an event
     */
    off(event, handler) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.eventHandlers.delete(event);
            }
        }
    }

    /**
     * Subscribe to Twitter user updates
     */
    subscribeToUser(username) {
        this.subscriptions.add({ type: 'user', username });
        this.send(ApiConfig.wsEvents.client.SUBSCRIBE, {
            type: 'user',
            username,
        });
    }

    /**
     * Unsubscribe from Twitter user updates
     */
    unsubscribeFromUser(username) {
        this.subscriptions.delete({ type: 'user', username });
        this.send(ApiConfig.wsEvents.client.UNSUBSCRIBE, {
            type: 'user',
            username,
        });
    }

    /**
     * Subscribe to keyword updates
     */
    subscribeToKeyword(keyword) {
        this.subscriptions.add({ type: 'keyword', keyword });
        this.send(ApiConfig.wsEvents.client.SUBSCRIBE, {
            type: 'keyword',
            keyword,
        });
    }

    /**
     * Unsubscribe from keyword updates
     */
    unsubscribeFromKeyword(keyword) {
        this.subscriptions.delete({ type: 'keyword', keyword });
        this.send(ApiConfig.wsEvents.client.UNSUBSCRIBE, {
            type: 'keyword',
            keyword,
        });
    }

    /**
     * Handle incoming messages
     */
    handleMessage(event) {
        try {
            const message = JSON.parse(event.data);
            console.log('WebSocket message received:', message);

            // Handle ping/pong
            if (message.event === ApiConfig.wsEvents.server.PONG) {
                return;
            }

            // Emit to local handlers
            this.emit(message.event, message.data);

            // Emit to global event bus
            window.eventBus?.emit(`ws:${message.event}`, message.data);

            // Handle specific message types
            switch (message.event) {
                case ApiConfig.wsEvents.server.TWEET_NEW:
                    this.handleNewTweet(message.data);
                    break;
                case ApiConfig.wsEvents.server.USER_STATUS:
                    this.handleUserStatus(message.data);
                    break;
                case ApiConfig.wsEvents.server.NOTIFICATION:
                    this.handleNotification(message.data);
                    break;
                case ApiConfig.wsEvents.server.ERROR:
                    this.handleError(message.data);
                    break;
            }
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    }

    /**
     * Handle new tweet
     */
    handleNewTweet(tweet) {
        // Store in local cache if needed
        window.twitterStream?.addTweet(tweet);
    }

    /**
     * Handle user status update
     */
    handleUserStatus(status) {
        // Update user status in UI
        window.followList?.updateUserStatus(status.username, status.online);
    }

    /**
     * Handle notification
     */
    handleNotification(notification) {
        // Show notification to user
        window.notificationManager?.show(notification);
    }

    /**
     * Handle error message
     */
    handleError(error) {
        console.error('WebSocket error message:', error);
        window.toastManager?.error(error.message || 'WebSocket error occurred');
    }

    /**
     * Emit event to local handlers
     */
    emit(event, data = null) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in WebSocket event handler for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Authenticate WebSocket connection
     */
    authenticate(token) {
        this.send(ApiConfig.wsEvents.client.AUTH, { token });
    }

    /**
     * Queue message for later sending
     */
    queueMessage(message) {
        this.messageQueue.push(message);
        if (this.messageQueue.length > 100) {
            // Remove oldest messages if queue gets too large
            this.messageQueue.shift();
        }
    }

    /**
     * Process queued messages
     */
    processMessageQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
            const message = this.messageQueue.shift();
            this.send(message.event, message.data);
        }
    }

    /**
     * Restore subscriptions after reconnection
     */
    restoreSubscriptions() {
        this.subscriptions.forEach(subscription => {
            this.send(ApiConfig.wsEvents.client.SUBSCRIBE, subscription);
        });
    }

    /**
     * Attempt to reconnect
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            window.eventBus?.emit('websocket:reconnect_failed');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

        setTimeout(() => {
            const token = authService.token;
            this.connect(token).catch(error => {
                console.error('Reconnection failed:', error);
            });
        }, delay);
    }

    /**
     * Start ping interval
     */
    startPingInterval() {
        this.stopPingInterval();
        this.pingInterval = setInterval(() => {
            if (this.isConnected) {
                this.send(ApiConfig.wsEvents.client.PING);
            }
        }, 30000); // Ping every 30 seconds
    }

    /**
     * Stop ping interval
     */
    stopPingInterval() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            queueSize: this.messageQueue.length,
            subscriptions: this.subscriptions.size,
        };
    }
}

// Create singleton instance
const webSocketService = new WebSocketService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = webSocketService;
}