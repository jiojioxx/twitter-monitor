/**
 * State Manager
 */
class StateManager {
    constructor() {
        this.state = {};
        this.subscribers = new Map();
        this.middleware = [];
    }

    /**
     * Get state value
     */
    get(key, defaultValue = null) {
        return this.state[key] || defaultValue;
    }

    /**
     * Set state value
     */
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;

        // Notify subscribers
        this.notify(key, value, oldValue);
    }

    /**
     * Subscribe to state changes
     */
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key).add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(key);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    /**
     * Notify subscribers
     */
    notify(key, newValue, oldValue) {
        const callbacks = this.subscribers.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error(`Error in state subscriber for ${key}:`, error);
                }
            });
        }
    }

    /**
     * Save state to storage
     */
    saveState() {
        StorageService.set('app_state', this.state);
    }

    /**
     * Load state from storage
     */
    loadState() {
        const savedState = StorageService.get('app_state', {});
        this.state = { ...this.state, ...savedState };
    }
}