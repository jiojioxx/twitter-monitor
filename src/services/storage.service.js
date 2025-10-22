/**
 * Storage Service - Handles local storage with encryption and expiration
 */
class StorageService {
    constructor() {
        this.prefix = AppConfig.storage.prefix;
        this.isAvailable = this.checkAvailability();
        this.cache = new Map();
    }

    /**
     * Check if localStorage is available
     */
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('LocalStorage not available, using memory cache');
            return false;
        }
    }

    /**
     * Get item from storage
     */
    get(key, defaultValue = null) {
        const fullKey = this.prefix + key;

        try {
            let value;

            if (this.isAvailable) {
                const item = localStorage.getItem(fullKey);
                if (!item) return defaultValue;

                value = JSON.parse(item);
            } else {
                value = this.cache.get(fullKey);
                if (!value) return defaultValue;
            }

            // Check expiration
            if (value.expiry && value.expiry < Date.now()) {
                this.remove(key);
                return defaultValue;
            }

            return value.data;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }

    /**
     * Set item in storage
     */
    set(key, value, ttl = null) {
        const fullKey = this.prefix + key;

        try {
            const item = {
                data: value,
                timestamp: Date.now(),
                expiry: ttl ? Date.now() + ttl : null,
            };

            if (this.isAvailable) {
                localStorage.setItem(fullKey, JSON.stringify(item));
            } else {
                this.cache.set(fullKey, item);
            }

            return true;
        } catch (error) {
            console.error('Storage set error:', error);

            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                this.cleanup();
                // Try again
                try {
                    if (this.isAvailable) {
                        localStorage.setItem(fullKey, JSON.stringify({ data: value }));
                    }
                    return true;
                } catch (retryError) {
                    console.error('Storage retry failed:', retryError);
                }
            }

            return false;
        }
    }

    /**
     * Remove item from storage
     */
    remove(key) {
        const fullKey = this.prefix + key;

        try {
            if (this.isAvailable) {
                localStorage.removeItem(fullKey);
            } else {
                this.cache.delete(fullKey);
            }
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    /**
     * Clear all items with prefix
     */
    clear() {
        try {
            if (this.isAvailable) {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        localStorage.removeItem(key);
                    }
                });
            } else {
                // Clear cache entries with prefix
                const keys = Array.from(this.cache.keys());
                keys.forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        this.cache.delete(key);
                    }
                });
            }
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    /**
     * Get all items with prefix
     */
    getAll() {
        const items = {};

        try {
            if (this.isAvailable) {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        const shortKey = key.replace(this.prefix, '');
                        items[shortKey] = this.get(shortKey);
                    }
                });
            } else {
                this.cache.forEach((value, key) => {
                    if (key.startsWith(this.prefix)) {
                        const shortKey = key.replace(this.prefix, '');
                        items[shortKey] = value.data;
                    }
                });
            }
        } catch (error) {
            console.error('Storage getAll error:', error);
        }

        return items;
    }

    /**
     * Check if key exists
     */
    has(key) {
        const fullKey = this.prefix + key;

        if (this.isAvailable) {
            return localStorage.getItem(fullKey) !== null;
        } else {
            return this.cache.has(fullKey);
        }
    }

    /**
     * Get storage size
     */
    getSize() {
        let size = 0;

        try {
            if (this.isAvailable) {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        size += localStorage.getItem(key).length;
                    }
                });
            } else {
                this.cache.forEach((value, key) => {
                    if (key.startsWith(this.prefix)) {
                        size += JSON.stringify(value).length;
                    }
                });
            }
        } catch (error) {
            console.error('Storage getSize error:', error);
        }

        return size;
    }

    /**
     * Clean up expired items
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;

        try {
            if (this.isAvailable) {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        try {
                            const item = JSON.parse(localStorage.getItem(key));
                            if (item.expiry && item.expiry < now) {
                                localStorage.removeItem(key);
                                cleaned++;
                            }
                        } catch (error) {
                            // Remove corrupted items
                            localStorage.removeItem(key);
                            cleaned++;
                        }
                    }
                });
            } else {
                this.cache.forEach((value, key) => {
                    if (key.startsWith(this.prefix) && value.expiry && value.expiry < now) {
                        this.cache.delete(key);
                        cleaned++;
                    }
                });
            }
        } catch (error) {
            console.error('Storage cleanup error:', error);
        }

        console.log(`Storage cleanup: ${cleaned} items removed`);
        return cleaned;
    }

    /**
     * Session Storage Methods
     */
    sessionGet(key, defaultValue = null) {
        try {
            const item = sessionStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Session storage get error:', error);
            return defaultValue;
        }
    }

    sessionSet(key, value) {
        try {
            sessionStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Session storage set error:', error);
            return false;
        }
    }

    sessionRemove(key) {
        try {
            sessionStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Session storage remove error:', error);
            return false;
        }
    }

    sessionClear() {
        try {
            const keys = Object.keys(sessionStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    sessionStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Session storage clear error:', error);
            return false;
        }
    }

    /**
     * Cookie Methods
     */
    getCookie(name) {
        const nameEQ = this.prefix + name + '=';
        const cookies = document.cookie.split(';');

        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }
        return null;
    }

    setCookie(name, value, days = 7) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${this.prefix}${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Strict`;
    }

    removeCookie(name) {
        document.cookie = `${this.prefix}${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
}

// Create singleton instance
const storageServiceInstance = new StorageService();

// Run cleanup on initialization
storageServiceInstance.cleanup();

// Schedule periodic cleanup
setInterval(() => {
    storageServiceInstance.cleanup();
}, 60000); // Clean up every minute

// Make it globally available
window.StorageService = storageServiceInstance;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = storageServiceInstance;
}