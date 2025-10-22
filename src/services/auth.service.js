/**
 * Authentication Service - Handles user authentication and session management
 */
class AuthService {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.token = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        this.refreshTimer = null;
    }

    /**
     * Initialize authentication from stored session
     */
    async initialize() {
        // Return early if no StorageService or apiService
        if (!window.StorageService || !window.apiService) {
            console.warn('Services not available, skipping auth initialization');
            return false;
        }

        const storedToken = window.StorageService.get('auth_token');
        const storedRefreshToken = window.StorageService.get('refresh_token');
        const storedUser = window.StorageService.get('user');

        if (storedToken && storedUser) {
            this.token = storedToken;
            this.refreshToken = storedRefreshToken;
            this.currentUser = storedUser;
            this.isAuthenticated = true;

            // Set token in API service
            apiService.setToken(this.token);

            // Verify token validity
            try {
                await this.verifyToken();
                this.setupTokenRefresh();
            } catch (error) {
                console.error('Token verification failed:', error);
                this.logout();
            }
        }

        return this.isAuthenticated;
    }

    /**
     * Login with credentials
     */
    async login(credentials) {
        try {
            const response = await apiService.post(ApiConfig.endpoints.auth.login, credentials);

            if (response.success) {
                this.handleAuthSuccess(response.data);
                return { success: true, user: this.currentUser };
            }

            return { success: false, error: response.message };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Login with wallet
     */
    async loginWithWallet(walletAddress, signature) {
        try {
            const response = await apiService.post(ApiConfig.endpoints.wallet.connect, {
                address: walletAddress,
                signature: signature,
            });

            if (response.success) {
                this.handleAuthSuccess(response.data);
                return { success: true, user: this.currentUser };
            }

            return { success: false, error: response.message };
        } catch (error) {
            console.error('Wallet login error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            // Call logout endpoint if authenticated
            if (this.isAuthenticated) {
                await apiService.post(ApiConfig.endpoints.auth.logout);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearSession();
            window.eventBus?.emit('auth:logout');
            window.location.href = '/';
        }
    }

    /**
     * Register new user
     */
    async register(userData) {
        try {
            const response = await apiService.post(ApiConfig.endpoints.auth.register, userData);

            if (response.success) {
                // Auto-login after registration
                return this.login({
                    email: userData.email,
                    password: userData.password,
                });
            }

            return { success: false, error: response.message };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verify token validity
     */
    async verifyToken() {
        try {
            const response = await apiService.post(ApiConfig.endpoints.auth.verify, {
                token: this.token,
            });

            if (!response.success) {
                throw new Error('Token verification failed');
            }

            // Update user data if provided
            if (response.data?.user) {
                this.currentUser = response.data.user;
                StorageService.set('user', this.currentUser);
            }

            return true;
        } catch (error) {
            console.error('Token verification error:', error);
            throw error;
        }
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await apiService.post(ApiConfig.endpoints.auth.refresh, {
                refreshToken: this.refreshToken,
            });

            if (response.success) {
                this.token = response.data.token;
                this.tokenExpiry = response.data.expiry;

                // Update stored token
                StorageService.set('auth_token', this.token);

                // Update API service
                apiService.setToken(this.token);

                // Reset refresh timer
                this.setupTokenRefresh();

                return true;
            }

            throw new Error('Token refresh failed');
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            throw error;
        }
    }

    /**
     * Handle successful authentication
     */
    handleAuthSuccess(data) {
        this.token = data.token;
        this.refreshToken = data.refreshToken;
        this.currentUser = data.user;
        this.tokenExpiry = data.expiry;
        this.isAuthenticated = true;

        // Store in local storage
        StorageService.set('auth_token', this.token);
        StorageService.set('refresh_token', this.refreshToken);
        StorageService.set('user', this.currentUser);

        // Set token in API service
        apiService.setToken(this.token);

        // Setup auto-refresh
        this.setupTokenRefresh();

        // Emit authentication event
        window.eventBus?.emit('auth:success', this.currentUser);
    }

    /**
     * Clear session data
     */
    clearSession() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.token = null;
        this.refreshToken = null;
        this.tokenExpiry = null;

        // Clear refresh timer
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }

        // Clear storage
        StorageService.remove('auth_token');
        StorageService.remove('refresh_token');
        StorageService.remove('user');

        // Clear API token
        apiService.setToken(null);
    }

    /**
     * Setup automatic token refresh
     */
    setupTokenRefresh() {
        // Clear existing timer
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        if (!this.tokenExpiry) {
            return;
        }

        // Calculate refresh time (5 minutes before expiry)
        const now = Date.now();
        const expiry = new Date(this.tokenExpiry).getTime();
        const refreshTime = expiry - now - (5 * 60 * 1000);

        if (refreshTime > 0) {
            this.refreshTimer = setTimeout(() => {
                this.refreshAccessToken();
            }, refreshTime);
        } else {
            // Token about to expire, refresh immediately
            this.refreshAccessToken();
        }
    }

    /**
     * Check if user has specific permission
     */
    hasPermission(permission) {
        if (!this.isAuthenticated || !this.currentUser) {
            return false;
        }

        return this.currentUser.permissions?.includes(permission) || false;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        if (!this.isAuthenticated || !this.currentUser) {
            return false;
        }

        return this.currentUser.roles?.includes(role) || false;
    }

    /**
     * Update user profile
     */
    async updateProfile(profileData) {
        try {
            const response = await apiService.put(ApiConfig.endpoints.user.update, profileData);

            if (response.success) {
                this.currentUser = { ...this.currentUser, ...response.data };
                StorageService.set('user', this.currentUser);
                window.eventBus?.emit('user:updated', this.currentUser);
                return { success: true, user: this.currentUser };
            }

            return { success: false, error: response.message };
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Change password
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await apiService.post(ApiConfig.endpoints.auth.changePassword, {
                currentPassword,
                newPassword,
            });

            return { success: response.success, message: response.message };
        } catch (error) {
            console.error('Password change error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Request password reset
     */
    async requestPasswordReset(email) {
        try {
            const response = await apiService.post(ApiConfig.endpoints.auth.resetPassword, {
                email,
            });

            return { success: response.success, message: response.message };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create singleton instance
const authService = new AuthService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = authService;
}