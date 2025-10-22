/**
 * Simple Router - Hash-based routing
 */
class Router {
    constructor() {
        this.routes = new Map();
        this.notFoundHandler = null;
        this.currentRoute = null;
    }

    /**
     * Add route
     */
    addRoute(path, handler) {
        // Normalize path to remove leading slash
        const normalizedPath = path.replace(/^\//, '');
        this.routes.set(normalizedPath, handler);
    }

    /**
     * Set not found handler
     */
    setNotFoundHandler(handler) {
        this.notFoundHandler = handler;
    }

    /**
     * Navigate to path
     */
    navigate(path) {
        const normalizedPath = path.replace(/^\//, '');
        window.location.hash = normalizedPath || '';
    }

    /**
     * Get current hash path
     */
    getCurrentPath() {
        return window.location.hash.slice(1) || '';
    }

    /**
     * Handle current route
     */
    handleRoute() {
        const path = this.getCurrentPath();
        const handler = this.routes.get(path);

        if (handler) {
            this.currentRoute = path;
            handler();
        } else if (this.notFoundHandler) {
            this.notFoundHandler();
        }
    }

    /**
     * Start router
     */
    start() {
        // Handle initial route
        this.handleRoute();

        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });
    }
}