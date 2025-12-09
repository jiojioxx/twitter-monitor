/**
 * PluginHome Module - 插件首页
 * 加密钱包安全插件首页界面
 */
class PluginHome {
    constructor() {
        this.container = document.getElementById('plugin-home-module');
        this.walletAddress = '0xe6b5...850a39';
        this.protectedDays = 180;
        this.savedAmount = 198;
        this.fearGreedIndex = 25;
        this.btcPrice = 92591.39;
        this.btcChange = -2.36;
    }

    async init() {
        this.render();
        this.attachEventListeners();
        this.loadNewsData();
    }

    render() {
        this.container.innerHTML = `
            <div class="plugin-home-container">
                <!-- 顶部区域 -->
                <div class="plugin-header">
                    <div class="plugin-logo">LOGO</div>
                    <button class="protection-status-btn">
                        <span class="status-icon"></span>
                        <span>保护中</span>
                    </button>
                </div>

                <!-- 钱包信息卡片 -->
                <div class="wallet-card">
                    <div class="wallet-header">
                        <div class="wallet-avatar"></div>
                        <div class="wallet-info">
                            <div class="wallet-address">${this.walletAddress}</div>
                            <div class="wallet-stats">
                                <span>已保护 ${this.protectedDays}天</span>
                                <span class="separator">|</span>
                                <span>避免损失 $${this.savedAmount}</span>
                            </div>
                        </div>
                        <button class="wallet-remove-btn">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM5.354 4.646a.5.5 0 10-.708.708L7.293 8l-2.647 2.646a.5.5 0 00.708.708L8 8.707l2.646 2.647a.5.5 0 00.708-.708L8.707 8l2.647-2.646a.5.5 0 00-.708-.708L8 7.293 5.354 4.646z"/>
                            </svg>
                        </button>
                    </div>

                    <!-- 安全待办 -->
                    <div class="security-todos">
                        <div class="todos-header">
                            <div class="todos-title">
                                <span>安全待办</span>
                                <span class="todos-count">2项</span>
                            </div>
                            <a href="#" class="view-all-link">查看全部 ></a>
                        </div>
                        <div class="todos-list">
                            <div class="todo-item">
                                <span class="todo-icon"></span>
                                <span class="todo-text">检查钱包风险</span>
                                <span class="todo-arrow">></span>
                            </div>
                            <div class="todo-item">
                                <span class="todo-icon"></span>
                                <span class="todo-text">订阅链上高级防护，监控钱包安全</span>
                                <span class="todo-arrow">></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 功能按钮区 -->
                <div class="feature-buttons">
                    <button class="feature-btn" data-feature="wallet-check">
                        <div class="feature-icon">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <rect width="48" height="48" rx="8" fill="#f5f5f5"/>
                            </svg>
                        </div>
                        <span class="feature-label">钱包体检</span>
                    </button>
                    <button class="feature-btn" data-feature="market-track">
                        <div class="feature-icon">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <rect width="48" height="48" rx="8" fill="#f5f5f5"/>
                            </svg>
                        </div>
                        <span class="feature-label">币场追踪</span>
                    </button>
                    <button class="feature-btn" data-feature="token-check">
                        <div class="feature-icon">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <rect width="48" height="48" rx="8" fill="#f5f5f5"/>
                            </svg>
                        </div>
                        <span class="feature-label">代币安全检查</span>
                    </button>
                    <button class="feature-btn" data-feature="more-services">
                        <div class="feature-icon">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <rect width="48" height="48" rx="8" fill="#f5f5f5"/>
                            </svg>
                        </div>
                        <span class="feature-label">更多安全服务</span>
                    </button>
                </div>

                <!-- 广告Banner区域 -->
                <div class="ad-banner" id="ad-banner" style="display: none;">
                    <button class="banner-close">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 0a10 10 0 100 20 10 10 0 000-20zM7.5 6.5l2.5 2.5-2.5 2.5 1 1 2.5-2.5 2.5 2.5 1-1-2.5-2.5 2.5-2.5-1-1-2.5 2.5-2.5-2.5-1 1z"/>
                        </svg>
                    </button>
                    <div class="banner-content">
                        <p>推广banner，无内容时隐藏</p>
                    </div>
                </div>

                <!-- 数据展示区 -->
                <div class="data-cards">
                    <!-- 恐慌贪婪指数 -->
                    <div class="data-card fear-greed-card">
                        <div class="card-header">
                            <span class="card-title">恐慌贪婪指数</span>
                        </div>
                        <div class="card-content">
                            <div class="index-value">${this.fearGreedIndex}</div>
                            <div class="index-chart">
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" stroke-width="12"/>
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#ff6b6b" stroke-width="12"
                                            stroke-dasharray="${(this.fearGreedIndex / 100) * 314} 314"
                                            transform="rotate(-90 60 60)"/>
                                </svg>
                                <div class="index-label">恐慌</div>
                            </div>
                        </div>
                    </div>

                    <!-- BTC价格 -->
                    <div class="data-card btc-price-card">
                        <div class="card-header">
                            <span class="card-title">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <circle cx="8" cy="8" r="8" fill="#f7931a"/>
                                </svg>
                                BTC价格
                            </span>
                        </div>
                        <div class="card-content">
                            <div class="price-value">${this.btcPrice.toLocaleString()}</div>
                            <div class="price-change ${this.btcChange >= 0 ? 'positive' : 'negative'}">
                                <span>${this.btcChange >= 0 ? '▲' : '▼'} ${Math.abs(this.btcChange)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 行情解读 -->
                <div class="news-section">
                    <h3 class="section-title">行情解读</h3>
                    <div class="news-list" id="news-list">
                        <!-- 新闻列表将通过JavaScript动态加载 -->
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // 保护状态按钮点击
        const protectionBtn = this.container.querySelector('.protection-status-btn');
        if (protectionBtn) {
            protectionBtn.addEventListener('click', () => {
                this.handleProtectionStatus();
            });
        }

        // 钱包移除按钮
        const removeBtn = this.container.querySelector('.wallet-remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.handleRemoveWallet();
            });
        }

        // 功能按钮
        const featureBtns = this.container.querySelectorAll('.feature-btn');
        featureBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const feature = btn.dataset.feature;
                this.handleFeatureClick(feature);
            });
        });

        // 待办事项点击
        const todoItems = this.container.querySelectorAll('.todo-item');
        todoItems.forEach(item => {
            item.addEventListener('click', () => {
                this.handleTodoClick(item);
            });
        });

        // 广告banner关闭
        const bannerClose = this.container.querySelector('.banner-close');
        if (bannerClose) {
            bannerClose.addEventListener('click', () => {
                const banner = this.container.querySelector('.ad-banner');
                if (banner) banner.style.display = 'none';
            });
        }
    }

    loadNewsData() {
        // 模拟新闻数据
        const newsData = [
            {
                title: '43天数据真实的全球市场：AI熄火、Crypto震荡，12月怎么走？',
                time: '2025-12-3 14:25',
                tags: ['BTC', '安全']
            },
            {
                title: '矿企巨头Bitfury豪掷5000万美元入局，6000张H100等效算力的Gonka有何魅力？',
                time: '2025-12-3 14:25',
                tags: ['投资', '技术']
            },
            {
                title: '从Sahara到Tradoor，盘点近期山寨币"花式下跌"套路',
                time: '2025-12-3 14:25',
                tags: ['币安', '空投']
            }
        ];

        const newsList = this.container.querySelector('#news-list');
        if (!newsList) return;

        newsList.innerHTML = newsData.map(news => `
            <div class="news-item">
                <h4 class="news-title">${news.title}</h4>
                <div class="news-meta">
                    <span class="news-time">${news.time}</span>
                    <div class="news-tags">
                        ${news.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    handleProtectionStatus() {
        console.log('Protection status clicked');
        // 这里可以添加显示保护详情的逻辑
    }

    handleRemoveWallet() {
        if (confirm('确定要移除此钱包吗？')) {
            console.log('Wallet removed');
            // 这里可以添加移除钱包的逻辑
        }
    }

    handleFeatureClick(feature) {
        console.log(`Feature clicked: ${feature}`);
        // 根据不同的功能跳转到相应页面或执行相应操作
        switch(feature) {
            case 'wallet-check':
                // 跳转到钱包体检页面
                break;
            case 'market-track':
                // 跳转到币场追踪页面
                break;
            case 'token-check':
                // 跳转到代币安全检查页面
                break;
            case 'more-services':
                // 显示更多服务
                break;
        }
    }

    handleTodoClick(item) {
        console.log('Todo item clicked:', item.querySelector('.todo-text').textContent);
        // 这里可以添加处理待办事项的逻辑
    }

    destroy() {
        // 清理事件监听器
        this.container.innerHTML = '';
    }
}
