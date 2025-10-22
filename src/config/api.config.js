/**
 * API Configuration
 */
const ApiConfig = {
    // Base URL for API endpoints
    baseURL: 'http://localhost:3001/api',

    // WebSocket URL
    wsURL: 'ws://localhost:3001',

    // API Version
    version: 'v1',

    // Request timeout (in milliseconds)
    timeout: 30000,

    // Retry configuration
    retry: {
        maxAttempts: 3,
        delay: 1000,
        backoff: 2,
    },

    // Headers
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },

    // API Endpoints
    endpoints: {
        // Authentication
        auth: {
            login: '/auth/login',
            logout: '/auth/logout',
            refresh: '/auth/refresh',
            verify: '/auth/verify',
        },

        // User Management
        user: {
            profile: '/user/profile',
            update: '/user/update',
            settings: '/user/settings',
            delete: '/user/delete',
        },

        // Twitter Monitoring
        twitter: {
            follow: {
                list: '/twitter/follow/list',
                add: '/twitter/follow/add',
                remove: '/twitter/follow/remove',
                status: '/twitter/follow/status',
            },
            stream: {
                start: '/twitter/stream/start',
                stop: '/twitter/stream/stop',
                history: '/twitter/stream/history',
                filter: '/twitter/stream/filter',
            },
            keywords: {
                list: '/twitter/keywords/list',
                add: '/twitter/keywords/add',
                remove: '/twitter/keywords/remove',
            },
        },

        // Analytics
        analytics: {
            overview: '/analytics/overview',
            trends: '/analytics/trends',
            engagement: '/analytics/engagement',
            export: '/analytics/export',
        },

        // Notifications
        notifications: {
            list: '/notifications/list',
            read: '/notifications/read',
            settings: '/notifications/settings',
            test: '/notifications/test',
        },

        // Wallet
        wallet: {
            connect: '/wallet/connect',
            disconnect: '/wallet/disconnect',
            verify: '/wallet/verify',
            balance: '/wallet/balance',
        },
    },

    // Rate Limiting
    rateLimit: {
        maxRequests: 100,
        windowMs: 60000, // 1 minute
    },

    // Response codes
    responseCodes: {
        SUCCESS: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        UNPROCESSABLE_ENTITY: 422,
        TOO_MANY_REQUESTS: 429,
        INTERNAL_SERVER_ERROR: 500,
        SERVICE_UNAVAILABLE: 503,
    },

    // WebSocket Events
    wsEvents: {
        // Client -> Server
        client: {
            SUBSCRIBE: 'subscribe',
            UNSUBSCRIBE: 'unsubscribe',
            PING: 'ping',
            AUTH: 'authenticate',
        },

        // Server -> Client
        server: {
            TWEET_NEW: 'tweet:new',
            TWEET_UPDATE: 'tweet:update',
            TWEET_DELETE: 'tweet:delete',
            USER_STATUS: 'user:status',
            NOTIFICATION: 'notification',
            ERROR: 'error',
            PONG: 'pong',
            CONNECTED: 'connected',
            DISCONNECTED: 'disconnected',
        },
    },

    // Mock Data (for development)
    useMockData: false,
    mockDelay: 500,
};

// Helper function to build full API URL
ApiConfig.buildUrl = function(endpoint) {
    return `${this.baseURL}/${this.version}${endpoint}`;
};

// Helper function to get endpoint
ApiConfig.getEndpoint = function(path) {
    const parts = path.split('.');
    let endpoint = this.endpoints;

    for (const part of parts) {
        endpoint = endpoint[part];
        if (!endpoint) {
            throw new Error(`Endpoint not found: ${path}`);
        }
    }

    return this.buildUrl(endpoint);
};

// Freeze the configuration
Object.freeze(ApiConfig);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiConfig;
}