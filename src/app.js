/**
 * Main Application Entry Point
 */
class TwitterMonitorApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
        this.currentModule = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) {
            return;
        }

        try {
            console.log('Initializing Twitter Monitor App...');

            // Initialize core systems
            await this.initializeCore();

            // Initialize services
            await this.initializeServices();

            // Initialize modules
            await this.initializeModules();

            // Setup routing
            this.setupRouting();

            // Setup global event listeners
            this.setupEventListeners();

            // Show default module (关注列表)
            this.showModule('monitor');

            this.isInitialized = true;
            console.log('Twitter Monitor App initialized successfully');

            // Emit app ready event
            window.eventBus.emit('app:ready');

        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('应用初始化失败，请刷新页面重试');
        }
    }

    /**
     * Initialize core systems
     */
    async initializeCore() {
        // Initialize event bus
        window.eventBus = new EventBus();

        // Initialize router
        window.router = new Router();

        // Initialize state manager
        window.stateManager = new StateManager();

        // Initialize theme
        this.initializeTheme();
    }

    /**
     * Initialize services
     */
    async initializeServices() {
        // Initialize authentication
        if (window.authService) {
            try {
                const isAuthenticated = await authService.initialize();

                // Initialize WebSocket if authenticated
                if (isAuthenticated && AppConfig.features.enableWebSocket && window.webSocketService) {
                    try {
                        await webSocketService.connect(authService.token);
                    } catch (error) {
                        console.warn('WebSocket connection failed:', error);
                    }
                }
            } catch (error) {
                console.warn('Auth initialization failed:', error);
            }
        }

        // Initialize storage cleanup
        if (window.StorageService) {
            window.StorageService.cleanup();
        }
    }

    /**
     * Initialize modules
     */
    async initializeModules() {
        // Initialize header
        this.modules.header = new Header();
        await this.modules.header.init();

        // Initialize monitor (关注列表)
        this.modules.monitor = new Monitor();
        await this.modules.monitor.init();

        // Initialize feed (信息流)
        if (typeof Feed !== 'undefined') {
            this.modules.feed = new Feed();
            await this.modules.feed.init();
        }

        // Initialize posts (其他平台)
        if (typeof Posts !== 'undefined') {
            this.modules.posts = new Posts();
            await this.modules.posts.init();
        }

        // Initialize settings (通知设置)
        if (typeof Settings !== 'undefined') {
            this.modules.settings = new Settings();
            await this.modules.settings.init();
        }

        // Initialize DevHunter (Dev Hunter)
        if (typeof DevHunter !== 'undefined') {
            this.modules.devhunter = new DevHunter();
            await this.modules.devhunter.init();
        }

        // Initialize AddressAnalyzer (地址分析)
        if (typeof AddressAnalyzer !== 'undefined') {
            this.modules.analyzer = new AddressAnalyzer();
            await this.modules.analyzer.init();
        }

        // Initialize dashboard (deprecated)
        if (typeof Dashboard !== 'undefined') {
            this.modules.dashboard = new Dashboard();
            await this.modules.dashboard.init();
        }

        // Initialize analytics (deprecated)
        if (typeof Analytics !== 'undefined') {
            this.modules.analytics = new Analytics();
            await this.modules.analytics.init();
        }

        // Initialize wallet manager
        if (typeof WalletManager !== 'undefined' && AppConfig.features.enableWalletConnection) {
            window.walletManager = new WalletManager();
            await window.walletManager.init();
        }

        // Initialize notification manager
        if (typeof NotificationManager !== 'undefined' && AppConfig.features.enableNotifications) {
            window.notificationManager = new NotificationManager();
            await window.notificationManager.init();
        }

        // Initialize UI components
        window.toastManager = new Toast();
        window.modalManager = new Modal();
        window.loaderManager = new Loader();
    }

    /**
     * Setup routing
     */
    setupRouting() {
        // Define routes (1fastx.com style)
        window.router.addRoute('/', () => this.showModule('monitor'));
        window.router.addRoute('/add', () => this.showModule('monitor'));
        window.router.addRoute('/feed', () => this.showModule('feed'));
        window.router.addRoute('/posts', () => this.showModule('posts'));
        window.router.addRoute('/settings', () => this.showModule('settings'));
        window.router.addRoute('/devhunter', () => this.showModule('devhunter'));
        window.router.addRoute('/analyzer', () => this.showModule('analyzer'));

        // Legacy routes
        window.router.addRoute('/monitor', () => this.showModule('monitor'));
        window.router.addRoute('/dashboard', () => this.showModule('dashboard'));
        window.router.addRoute('/analytics', () => this.showModule('analytics'));

        // Handle not found
        window.router.setNotFoundHandler(() => {
            this.showModule('monitor');
            window.router.navigate('/add');
        });

        // Start router
        window.router.start();
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Navigation events
        window.eventBus.on('navigate', (module) => {
            this.showModule(module);
        });

        // Authentication events
        window.eventBus.on('auth:success', (user) => {
            this.handleAuthSuccess(user);
        });

        window.eventBus.on('auth:logout', () => {
            this.handleLogout();
        });

        // WebSocket events
        window.eventBus.on('websocket:connected', () => {
            window.toastManager?.success('实时连接已建立');
        });

        window.eventBus.on('websocket:disconnected', () => {
            window.toastManager?.warning('实时连接已断开');
        });

        // Error events
        window.eventBus.on('error', (error) => {
            this.handleError(error);
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        window.addEventListener('online', () => {
            window.toastManager?.success('网络连接已恢复');
            this.handleOnline();
        });

        window.addEventListener('offline', () => {
            window.toastManager?.warning('网络连接已断开');
            this.handleOffline();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * Show specific module
     */
    showModule(moduleName) {
        if (!this.modules[moduleName]) {
            console.error(`Module ${moduleName} not found`);
            return;
        }

        // Hide all modules
        document.querySelectorAll('.module-container').forEach(container => {
            container.style.display = 'none';
        });

        // Show requested module
        const container = document.getElementById(`${moduleName}-module`);
        if (container) {
            container.style.display = 'block';
            this.currentModule = moduleName;

            // Update active navigation
            this.updateActiveNavigation(moduleName);

            // Load module data
            if (this.modules[moduleName].load) {
                this.modules[moduleName].load();
            }

            // Emit module change event
            window.eventBus.emit('module:changed', moduleName);
        }
    }

    /**
     * Update active navigation
     */
    updateActiveNavigation(moduleName) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[href="/${moduleName}"], [href="#${moduleName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Initialize theme
     */
    initializeTheme() {
        const savedTheme = window.StorageService ?
            window.StorageService.get('theme', AppConfig.ui.defaultTheme) :
            AppConfig.ui.defaultTheme;

        document.body.setAttribute('data-theme', savedTheme);

        window.eventBus.on('theme:changed', (theme) => {
            document.body.setAttribute('data-theme', theme);
            if (window.StorageService) {
                window.StorageService.set('theme', theme);
            }
        });
    }

    /**
     * Handle authentication success
     */
    async handleAuthSuccess(user) {
        // Connect WebSocket
        if (AppConfig.features.enableWebSocket) {
            try {
                await webSocketService.connect(authService.token);
            } catch (error) {
                console.warn('WebSocket connection failed after auth:', error);
            }
        }

        // Refresh current module
        if (this.currentModule && this.modules[this.currentModule].refresh) {
            this.modules[this.currentModule].refresh();
        }

        window.toastManager?.success(`欢迎回来, ${user.name || user.username}!`);
    }

    /**
     * Handle logout
     */
    handleLogout() {
        // Disconnect WebSocket
        webSocketService.disconnect();

        // Clear sensitive data
        this.clearSensitiveData();

        // Redirect to login or public page
        this.showModule('dashboard');
    }

    /**
     * Handle online event
     */
    handleOnline() {
        // Retry failed requests
        if (authService.isAuthenticated && AppConfig.features.enableWebSocket) {
            webSocketService.connect(authService.token);
        }

        // Refresh current module data
        if (this.currentModule && this.modules[this.currentModule].refresh) {
            this.modules[this.currentModule].refresh();
        }
    }

    /**
     * Handle offline event
     */
    handleOffline() {
        // Show offline mode indicator
        this.showOfflineMode();
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Key combinations
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.showModule('dashboard');
                    window.router.navigate('/dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    this.showModule('monitor');
                    window.router.navigate('/monitor');
                    break;
                case '3':
                    e.preventDefault();
                    this.showModule('analytics');
                    window.router.navigate('/analytics');
                    break;
                case ',':
                    e.preventDefault();
                    this.showModule('settings');
                    window.router.navigate('/settings');
                    break;
            }
        }

        // Escape key
        if (e.key === 'Escape') {
            // Close modal if open
            window.modalManager?.closeAll();
        }
    }

    /**
     * Handle errors
     */
    handleError(error) {
        console.error('Application error:', error);

        const message = error.message || AppConfig.errors.serverError;
        window.toastManager?.error(message);

        // Report error to monitoring service if available
        if (window.errorReporter) {
            window.errorReporter.report(error);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-container';
        errorContainer.innerHTML = `
            <div class="error-content">
                <h2>⚠️ 错误</h2>
                <p>${message}</p>
                <button onclick="window.location.reload()" class="btn btn-primary">
                    刷新页面
                </button>
            </div>
        `;

        document.body.appendChild(errorContainer);
    }

    /**
     * Show offline mode indicator
     */
    showOfflineMode() {
        // Add offline indicator to UI
        let indicator = document.getElementById('offline-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.className = 'offline-indicator';
            indicator.textContent = '离线模式';
            document.body.appendChild(indicator);
        }
    }

    /**
     * Clear sensitive data
     */
    clearSensitiveData() {
        // Clear auth tokens
        StorageService.remove('auth_token');
        StorageService.remove('refresh_token');
        StorageService.remove('user');

        // Clear other sensitive data
        StorageService.remove('wallet_address');
    }

    /**
     * Cleanup on app unload
     */
    cleanup() {
        // Disconnect WebSocket
        if (webSocketService.isConnected) {
            webSocketService.disconnect();
        }

        // Clear intervals and timeouts
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // Save state
        window.stateManager?.saveState();
    }

    /**
     * Get application info
     */
    getInfo() {
        return {
            name: AppConfig.app.name,
            version: AppConfig.app.version,
            isInitialized: this.isInitialized,
            currentModule: this.currentModule,
            modules: Object.keys(this.modules),
            isAuthenticated: authService.isAuthenticated,
            wsConnected: webSocketService.isConnected,
        };
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new TwitterMonitorApp();
    await window.app.init();
});

// Export for debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TwitterMonitorApp;
}