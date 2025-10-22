/**
 * Header Module
 */
class Header {
    constructor() {
        this.container = document.getElementById('header-module');
        this.currentTheme = 'light';
    }

    /**
     * Initialize header
     */
    async init() {
        this.render();
        this.setupEventListeners();
        this.loadTheme();
    }

    /**
     * Render header
     */
    render() {
        this.container.innerHTML = `
            <div class="header-top-bar">
                <button class="btn btn-icon mobile-menu-toggle" id="mobile-menu-toggle" title="菜单">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>

                <div class="header-logo">
                    <span class="logo-text">推特秒级监控</span>
                </div>

                <div class="header-actions">
                    <button class="btn btn-icon theme-toggle" id="theme-toggle" title="切换主题">
                        <svg class="theme-icon sun-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
                        </svg>
                        <svg class="theme-icon moon-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style="display: none;">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                        </svg>
                    </button>

                    <button class="btn btn-primary wallet-connect" id="wallet-connect">
                        连接钱包
                    </button>

                    <div class="user-menu" id="user-menu" style="display: none;">
                        <span class="user-address"></span>
                        <button class="btn btn-secondary user-disconnect">断开</button>
                    </div>
                </div>
            </div>

            <!-- 侧边栏遮罩层 -->
            <div class="sidebar-overlay" id="sidebar-overlay"></div>

            <nav class="sidebar-nav">
                <a href="#add" class="nav-link active" data-module="monitor">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                    </svg>
                    <span>关注列表</span>
                </a>
                <a href="#feed" class="nav-link" data-module="feed">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"/>
                    </svg>
                    <span>信息流</span>
                </a>
                <a href="#posts" class="nav-link" data-module="posts">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                        <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"/>
                    </svg>
                    <span>所有平台</span>
                </a>
                <a href="#settings" class="nav-link" data-module="settings">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                    </svg>
                    <span>通知设置</span>
                </a>
                <a href="#devhunter" class="nav-link" data-module="devhunter">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"/>
                    </svg>
                    <span>Dev Hunter</span>
                </a>
                <a href="#analyzer" class="nav-link" data-module="analyzer">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd"/>
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
                    </svg>
                    <span>地址分析</span>
                </a>
                <a href="https://notion.so" class="nav-link" target="_blank">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    <span>使用说明</span>
                </a>
            </nav>
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation links - improved event handling for elements with children
        this.container.addEventListener('click', (e) => {
            // Find the closest nav-link (handles clicks on SVG/span children)
            const navLink = e.target.closest('.nav-link');
            if (navLink && navLink.dataset.module) {
                e.preventDefault();
                const module = navLink.dataset.module;
                this.handleNavigation(module);
            }
        });

        // Theme toggle
        const themeToggle = this.container.querySelector('#theme-toggle');
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Wallet connect
        const walletConnect = this.container.querySelector('#wallet-connect');
        walletConnect.addEventListener('click', () => {
            this.handleWalletConnect();
        });

        // Mobile menu toggle
        const mobileMenuToggle = this.container.querySelector('#mobile-menu-toggle');
        const sidebar = this.container.querySelector('.sidebar-nav');
        const sidebarOverlay = this.container.querySelector('#sidebar-overlay');

        if (mobileMenuToggle && sidebar && sidebarOverlay) {
            // 切换侧边栏
            mobileMenuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                mobileMenuToggle.classList.toggle('active');
                sidebarOverlay.classList.toggle('active');
            });

            // 点击遮罩层关闭侧边栏
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            });

            // 点击导航链接后关闭侧边栏（移动端）
            const navLinks = sidebar.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove('active');
                        mobileMenuToggle.classList.remove('active');
                        sidebarOverlay.classList.remove('active');
                    }
                });
            });
        }

        // Listen for auth events
        window.eventBus.on('auth:success', (user) => {
            this.updateUserMenu(user);
        });

        window.eventBus.on('auth:logout', () => {
            this.hideUserMenu();
        });
    }

    /**
     * Handle navigation
     */
    handleNavigation(module) {
        // Update active state
        this.container.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        this.container.querySelectorAll(`[data-module="${module}"]`).forEach(link => {
            link.classList.add('active');
        });

        // Emit navigation event
        window.eventBus.emit('navigate', module);

        // Close mobile menu
        const mobileNav = this.container.querySelector('#mobile-nav');
        const mobileToggle = this.container.querySelector('#mobile-toggle');
        mobileNav.classList.remove('active');
        mobileToggle.classList.remove('active');
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';

        const sunIcon = this.container.querySelector('.sun-icon');
        const moonIcon = this.container.querySelector('.moon-icon');

        if (this.currentTheme === 'dark') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }

        document.body.setAttribute('data-theme', this.currentTheme);
        window.eventBus.emit('theme:changed', this.currentTheme);
    }

    /**
     * Load theme from storage
     */
    loadTheme() {
        const savedTheme = window.StorageService ?
            window.StorageService.get('theme', 'dark') : 'dark';
        this.currentTheme = savedTheme;

        const sunIcon = this.container.querySelector('.sun-icon');
        const moonIcon = this.container.querySelector('.moon-icon');

        if (sunIcon && moonIcon) {
            if (this.currentTheme === 'dark') {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        }

        document.body.setAttribute('data-theme', this.currentTheme);
    }

    /**
     * Handle wallet connect
     */
    handleWalletConnect() {
        window.eventBus.emit('wallet:connect:request');
    }

    /**
     * Update user menu
     */
    updateUserMenu(user) {
        const walletConnect = this.container.querySelector('#wallet-connect');
        const userMenu = this.container.querySelector('#user-menu');
        const userAddress = userMenu.querySelector('.user-address');

        walletConnect.style.display = 'none';
        userMenu.style.display = 'flex';

        if (user.address) {
            userAddress.textContent = Formatters.address(user.address);
        } else {
            userAddress.textContent = user.username || user.email;
        }
    }

    /**
     * Hide user menu
     */
    hideUserMenu() {
        const walletConnect = this.container.querySelector('#wallet-connect');
        const userMenu = this.container.querySelector('#user-menu');

        walletConnect.style.display = 'flex';
        userMenu.style.display = 'none';
    }
}