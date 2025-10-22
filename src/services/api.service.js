/**
 * API Service - Handles all HTTP requests to the backend
 */
class ApiService {
    constructor() {
        this.baseURL = ApiConfig.baseURL;
        this.timeout = ApiConfig.timeout;
        this.headers = { ...ApiConfig.headers };
        this.token = null;
        this.requestQueue = [];
        this.rateLimitRemaining = ApiConfig.rateLimit.maxRequests;
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        if (token) {
            this.headers['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.headers['Authorization'];
        }
    }

    /**
     * Generic request method
     */
    async request(method, endpoint, data = null, options = {}) {
        // Check rate limiting
        if (!this.checkRateLimit()) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }

        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

        const config = {
            method: method.toUpperCase(),
            headers: { ...this.headers, ...options.headers },
            ...options,
        };

        // Add body for POST, PUT, PATCH requests
        if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
            config.body = JSON.stringify(data);
        }

        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        config.signal = controller.signal;

        try {
            // Use mock data in development if enabled
            if (ApiConfig.useMockData) {
                return await this.mockRequest(method, endpoint, data);
            }

            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            // Update rate limit from response headers
            this.updateRateLimit(response);

            // Handle different response statuses
            if (!response.ok) {
                await this.handleError(response);
            }

            // Parse response
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return response;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error(AppConfig.errors.timeout);
            }

            throw error;
        }
    }

    /**
     * HTTP GET request
     */
    async get(endpoint, params = {}, options = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request('GET', url, null, options);
    }

    /**
     * HTTP POST request
     */
    async post(endpoint, data = {}, options = {}) {
        return this.request('POST', endpoint, data, options);
    }

    /**
     * HTTP PUT request
     */
    async put(endpoint, data = {}, options = {}) {
        return this.request('PUT', endpoint, data, options);
    }

    /**
     * HTTP PATCH request
     */
    async patch(endpoint, data = {}, options = {}) {
        return this.request('PATCH', endpoint, data, options);
    }

    /**
     * HTTP DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, null, options);
    }

    /**
     * Handle API errors
     */
    async handleError(response) {
        let errorMessage = AppConfig.errors.serverError;
        let errorData = null;

        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            }
        } catch (e) {
            // Failed to parse error response
        }

        switch (response.status) {
            case 401:
                errorMessage = AppConfig.errors.unauthorized;
                // Emit unauthorized event
                window.eventBus?.emit('auth:unauthorized');
                break;
            case 403:
                errorMessage = AppConfig.errors.forbidden;
                break;
            case 404:
                errorMessage = AppConfig.errors.notFound;
                break;
            case 422:
                errorMessage = AppConfig.errors.validation;
                break;
            case 429:
                errorMessage = 'Too many requests. Please slow down.';
                break;
            case 500:
            case 502:
            case 503:
                errorMessage = AppConfig.errors.serverError;
                break;
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = errorData;
        throw error;
    }

    /**
     * Check rate limiting
     */
    checkRateLimit() {
        return this.rateLimitRemaining > 0;
    }

    /**
     * Update rate limit from response headers
     */
    updateRateLimit(response) {
        const remaining = response.headers.get('X-RateLimit-Remaining');
        if (remaining !== null) {
            this.rateLimitRemaining = parseInt(remaining, 10);
        }

        const reset = response.headers.get('X-RateLimit-Reset');
        if (reset) {
            const resetTime = parseInt(reset, 10) * 1000;
            const now = Date.now();
            if (resetTime > now) {
                setTimeout(() => {
                    this.rateLimitRemaining = ApiConfig.rateLimit.maxRequests;
                }, resetTime - now);
            }
        }
    }

    /**
     * Mock request for development
     */
    async mockRequest(method, endpoint, data) {
        await new Promise(resolve => setTimeout(resolve, ApiConfig.mockDelay));

        // Return mock data based on endpoint
        if (endpoint.includes('/follow/list')) {
            return {
                success: true,
                data: [
                    { id: 1, username: 'elonmusk', name: 'Elon Musk', status: 'online' },
                    { id: 2, username: 'VitalikButerin', name: 'Vitalik Buterin', status: 'offline' },
                    { id: 3, username: 'cz_binance', name: 'CZ Binance', status: 'online' },
                ],
            };
        }

        if (endpoint.includes('/stream/history')) {
            return {
                success: true,
                data: [
                    {
                        id: '1',
                        author: 'Crypto Whale',
                        username: 'cryptowhale',
                        content: 'Bitcoin showing strong support at $45k level',
                        timestamp: Date.now() - 120000,
                        likes: 234,
                        retweets: 56,
                    },
                    {
                        id: '2',
                        author: 'DeFi Expert',
                        username: 'defiexpert',
                        content: 'New liquidity pool launched with amazing APY',
                        timestamp: Date.now() - 300000,
                        likes: 123,
                        retweets: 45,
                    },
                ],
            };
        }

        if (endpoint.includes('/analytics/overview')) {
            return {
                success: true,
                data: {
                    totalTweets: 15234,
                    totalFollowing: 89,
                    activeAlerts: 12,
                    avgResponseTime: 1.2,
                },
            };
        }

        return { success: true, data: null };
    }

    /**
     * Upload file
     */
    async uploadFile(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);

        // Add additional data to form
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        const headers = { ...this.headers };
        delete headers['Content-Type']; // Let browser set content-type for FormData

        return this.request('POST', endpoint, formData, { headers });
    }

    /**
     * Download file
     */
    async downloadFile(endpoint, filename) {
        const response = await this.request('GET', endpoint, null, {
            headers: { ...this.headers, 'Accept': 'application/octet-stream' },
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Batch requests
     */
    async batchRequests(requests) {
        const promises = requests.map(req =>
            this.request(req.method, req.endpoint, req.data, req.options)
        );
        return Promise.allSettled(promises);
    }
}

// Create singleton instance
const apiService = new ApiService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiService;
}