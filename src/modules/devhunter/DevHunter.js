/**
 * DevHunter Module - 开发者代币追踪系统
 * 监控Solana开发者创建的代币
 */
class DevHunter {
    constructor() {
        this.container = document.getElementById('devhunter-module');
        this.currentTab = 'search';
        this.isSearching = false;
        this.currentTokens = [];
        this.currentAddress = null;
        this.whitelist = [];
        this.thresholds = {
            marketCap: 100000,
            holderCount: 100,
            volume: 10000,
            priceChange: 50
        };
        this.telegramConfig = {
            botToken: '',
            chatId: '',
            checkInterval: 60, // 检查间隔（秒）
            notifications: {
                newToken: true,
                threshold: true,
                priceChange: true,
                volumeSpike: false
            }
        };

        // Telegram监控状态
        this.isMonitoring = false;
        this.monitoringInterval = null;

        // 初始化Helius API
        if (typeof HeliusAPI !== 'undefined') {
            this.heliusAPI = new HeliusAPI();
        } else {
            console.error('HeliusAPI未加载');
        }
    }

    async init() {
        this.loadStoredData();
        this.render();
        this.setupEventListeners();
    }

    loadStoredData() {
        // 从localStorage加载数据
        const savedWhitelist = localStorage.getItem('devHunter_whitelist');
        if (savedWhitelist) {
            this.whitelist = JSON.parse(savedWhitelist);
        }

        const savedThresholds = localStorage.getItem('devHunter_thresholds');
        if (savedThresholds) {
            this.thresholds = JSON.parse(savedThresholds);
        }

        const savedTelegramConfig = localStorage.getItem('devHunter_telegram');
        if (savedTelegramConfig) {
            this.telegramConfig = JSON.parse(savedTelegramConfig);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="devhunter-page">
                <!-- 标签页导航 -->
                <div class="devhunter-tabs">
                    <button class="devhunter-tab active" data-tab="search">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
                        </svg>
                        代币搜索
                    </button>
                    <button class="devhunter-tab" data-tab="whitelist">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                        </svg>
                        白名单配置
                    </button>
                    <button class="devhunter-tab" data-tab="telegram">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                        </svg>
                        TG Bot设置
                    </button>
                </div>

                <!-- 标签页内容 -->
                <div class="devhunter-content">
                    ${this.renderSearchTab()}
                    ${this.renderWhitelistTab()}
                    ${this.renderTelegramTab()}
                </div>
            </div>
        `;
    }

    renderSearchTab() {
        return `
            <div class="devhunter-tab-panel active" data-panel="search">
                <div class="devhunter-section">
                    <div class="section-header">
                        <h3 class="section-title">🔍 代币搜索</h3>
                        <p class="section-description">搜索指定Solana开发者创建的所有代币</p>
                    </div>

                    <div class="search-form">
                        <div class="form-group">
                            <label class="form-label">开发者钱包地址</label>
                            <input type="text" class="form-input" id="dev-address"
                                   placeholder="输入Solana钱包地址 (44位字符)" maxlength="44">
                            <p class="form-hint">输入你想要搜索的Solana开发者钱包地址</p>
                        </div>

                        <div class="button-group">
                            <button class="btn btn-primary" id="search-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
                                </svg>
                                搜索代币
                            </button>
                        </div>

                        <div class="test-addresses-section">
                            <span class="test-label">快速测试:</span>
                            <button class="btn btn-secondary btn-sm test-address-btn"
                                    data-address="wifq4CRwpXCK8NYtKNsQAYoDethT1aR7R1DaKCLFgAd">测试地址1</button>
                            <button class="btn btn-secondary btn-sm test-address-btn"
                                    data-address="61uiuu5aAc2HG1ZQaHd3opfLnK6cM4FQnE1jRi28pump">测试地址2</button>
                        </div>
                    </div>

                    <div class="search-results" id="search-results">
                        <div class="empty-state">
                            <div class="empty-state-icon">🔍</div>
                            <p class="empty-state-text">准备搜索</p>
                            <p class="empty-state-description">输入开发者地址开始搜索他们创建的代币</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderWhitelistTab() {
        return `
            <div class="devhunter-tab-panel" data-panel="whitelist">
                <div class="devhunter-section">
                    <div class="section-header">
                        <h3 class="section-title">📋 白名单配置</h3>
                        <p class="section-description">配置需要监控的开发者地址和触发阈值</p>
                    </div>

                    <!-- 添加开发者 -->
                    <div class="settings-card">
                        <h4 class="card-title">📝 添加白名单开发者</h4>
                        <div class="form-group">
                            <label class="form-label">开发者钱包地址</label>
                            <input type="text" class="form-input" id="whitelist-address"
                                   placeholder="输入要监控的开发者钱包地址">
                        </div>
                        <div class="form-group">
                            <label class="form-label">开发者标签 (可选)</label>
                            <input type="text" class="form-input" id="address-label"
                                   placeholder="给这个开发者起个名字">
                        </div>
                        <button class="btn btn-primary" id="add-address-btn">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                            </svg>
                            添加到白名单
                        </button>
                    </div>

                    <!-- 阈值设置 -->
                    <div class="settings-card">
                        <h4 class="card-title">⚙️ 监控阈值设置</h4>
                        <div class="threshold-grid">
                            <div class="form-group">
                                <label class="form-label">市值阈值 (USD)</label>
                                <input type="number" class="form-input" id="market-cap-threshold"
                                       placeholder="100000" value="${this.thresholds.marketCap}">
                                <p class="form-hint">当代币市值超过此值时触发通知</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">持有者数量</label>
                                <input type="number" class="form-input" id="holder-count-threshold"
                                       placeholder="100" value="${this.thresholds.holderCount}">
                                <p class="form-hint">当持有者数量超过此值时触发通知</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">24H交易量 (USD)</label>
                                <input type="number" class="form-input" id="volume-threshold"
                                       placeholder="10000" value="${this.thresholds.volume}">
                                <p class="form-hint">当24小时交易量超过此值时触发通知</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">价格变动 (%)</label>
                                <input type="number" class="form-input" id="price-change-threshold"
                                       placeholder="50" value="${this.thresholds.priceChange}">
                                <p class="form-hint">当价格变动超过此百分比时触发通知</p>
                            </div>
                        </div>
                        <button class="btn btn-success" id="save-threshold-btn">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"/>
                            </svg>
                            保存阈值设置
                        </button>
                    </div>

                    <!-- 开发者列表 -->
                    <div class="settings-card">
                        <div class="card-header-with-actions">
                            <h4 class="card-title">📜 监控开发者列表</h4>
                            <div class="card-actions">
                                <button class="btn btn-secondary btn-sm" id="export-whitelist-btn">
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                    </svg>
                                    导出
                                </button>
                                <input type="file" id="import-file-input" accept=".json" style="display: none;">
                                <button class="btn btn-secondary btn-sm" id="import-whitelist-btn">
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                    导入
                                </button>
                            </div>
                        </div>
                        <div class="whitelist-list" id="whitelist-list">
                            ${this.renderWhitelistItems()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderWhitelistItems() {
        if (this.whitelist.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p class="empty-state-text">暂无监控开发者</p>
                    <p class="empty-state-description">添加一些开发者地址开始监控他们创建的代币</p>
                </div>
            `;
        }

        return this.whitelist.map((item, index) => `
            <div class="whitelist-item">
                <div class="whitelist-info">
                    <h5 class="whitelist-name">${item.label || '未命名开发者'}</h5>
                    <code class="whitelist-address">${this.formatAddress(item.address)}</code>
                </div>
                <button class="btn btn-danger btn-sm remove-whitelist-btn" data-index="${index}">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    删除
                </button>
            </div>
        `).join('');
    }

    renderTelegramTab() {
        return `
            <div class="devhunter-tab-panel" data-panel="telegram">
                <div class="devhunter-section">
                    <div class="section-header">
                        <h3 class="section-title">🤖 Telegram Bot 配置</h3>
                        <p class="section-description">配置Telegram机器人进行实时监控推送</p>
                    </div>

                    <!-- Bot配置 -->
                    <div class="settings-card">
                        <h4 class="card-title">🔑 Bot基本配置</h4>
                        <div class="form-group">
                            <label class="form-label">Bot Token</label>
                            <input type="password" class="form-input" id="bot-token"
                                   placeholder="输入你的Telegram Bot Token" value="${this.telegramConfig.botToken}">
                            <p class="form-hint">从 @BotFather 获取的Bot Token</p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Chat ID</label>
                            <input type="text" class="form-input" id="chat-id"
                                   placeholder="输入要发送消息的Chat ID" value="${this.telegramConfig.chatId}">
                            <p class="form-hint">可以是群组ID或个人ID</p>
                        </div>
                        <button class="btn btn-primary" id="test-bot-btn">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            测试连接
                        </button>
                    </div>

                    <!-- 通知设置 -->
                    <div class="settings-card">
                        <h4 class="card-title">📢 通知设置</h4>
                        <div class="notification-options">
                            <label class="checkbox-label">
                                <input type="checkbox" id="notify-new-token" ${this.telegramConfig.notifications.newToken ? 'checked' : ''}>
                                <span>新代币创建通知</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="notify-threshold" ${this.telegramConfig.notifications.threshold ? 'checked' : ''}>
                                <span>阈值触发通知</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="notify-price-change" ${this.telegramConfig.notifications.priceChange ? 'checked' : ''}>
                                <span>价格变动通知</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="notify-volume-spike" ${this.telegramConfig.notifications.volumeSpike ? 'checked' : ''}>
                                <span>交易量异常通知</span>
                            </label>
                        </div>
                    </div>

                    <!-- 监控状态 -->
                    <div class="settings-card">
                        <h4 class="card-title">📊 监控状态</h4>
                        <div class="info-box">
                            <p><strong>🚀 实时监控</strong>：系统将以秒级频率自动监控白名单中的开发者地址</p>
                            <p>当检测到新代币创建或阈值触发时，将立即发送通知</p>
                        </div>
                        <div class="status-display">
                            <div class="status-item">
                                <span class="status-label">连接状态:</span>
                                <span class="status-value" id="connection-status">未连接</span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">监控状态:</span>
                                <span class="status-value" id="monitor-status">已停止</span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">上次检查:</span>
                                <span class="status-value" id="last-check">从未</span>
                            </div>
                        </div>
                        <div class="button-group">
                            <button class="btn btn-success" id="save-telegram-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"/>
                                </svg>
                                保存配置
                            </button>
                            <button class="btn btn-secondary" id="start-monitor-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
                                </svg>
                                开始监控
                            </button>
                            <button class="btn btn-danger" id="stop-monitor-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd"/>
                                </svg>
                                停止监控
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // 标签页切换
        const tabs = this.container.querySelectorAll('.devhunter-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                this.switchTab(targetTab);
            });
        });

        // 搜索功能
        this.setupSearchListeners();

        // 白名单功能
        this.setupWhitelistListeners();

        // Telegram功能
        this.setupTelegramListeners();
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // 更新标签按钮状态
        this.container.querySelectorAll('.devhunter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // 更新面板显示
        this.container.querySelectorAll('.devhunter-tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === tabName);
        });
    }

    setupSearchListeners() {
        const searchBtn = this.container.querySelector('#search-btn');
        const addressInput = this.container.querySelector('#dev-address');
        const testButtons = this.container.querySelectorAll('.test-address-btn');

        if (searchBtn && addressInput) {
            searchBtn.addEventListener('click', () => this.performSearch());

            addressInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        testButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const address = btn.dataset.address;
                addressInput.value = address;
                this.performSearch();
            });
        });
    }

    async performSearch() {
        if (this.isSearching) return;

        const addressInput = this.container.querySelector('#dev-address');
        const searchBtn = this.container.querySelector('#search-btn');
        const resultsContainer = this.container.querySelector('#search-results');

        const address = addressInput.value.trim();

        // 验证地址
        if (!this.validateSolanaAddress(address)) {
            if (window.toastManager) {
                window.toastManager.error('请输入有效的Solana钱包地址（32-44位字符）');
            }
            return;
        }

        this.isSearching = true;
        searchBtn.disabled = true;
        searchBtn.innerHTML = `
            <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="4" opacity="0.25"/>
                <path d="M12 2 a10 10 0 0 1 10 10" stroke-width="4"/>
            </svg>
            搜索中...
        `;

        resultsContainer.innerHTML = `
            <div class="loading-state">
                <div class="loader"></div>
                <p>正在搜索地址 ${this.formatAddress(address)} 创建的代币...</p>
            </div>
        `;

        try {
            // 使用Helius API搜索代币
            console.log(`🔍 开始搜索地址: ${address}`);

            const result = await this.heliusAPI.getTokensByCreator(address);

            if (result.success) {
                this.currentAddress = address;
                this.currentTokens = result.tokens;

                this.displaySearchResults(result.tokens, address);

                if (window.toastManager) {
                    window.toastManager.success(`找到 ${result.total} 个资产`);
                }

                // 异步获取市值数据（只针对Token类型）
                const tokenTypes = result.tokens.filter(t => t.assetType === 'Token');
                if (tokenTypes.length > 0) {
                    console.log(`开始获取 ${tokenTypes.length} 个代币的市值数据...`);

                    // 异步更新市值数据
                    this.heliusAPI.getBatchTokenMarketData(tokenTypes, (current, total, updatedToken) => {
                        // 实时更新UI中的代币卡片
                        this.updateTokenCard(updatedToken);

                        // 更新进度
                        console.log(`市值查询进度: ${current}/${total}`);
                    }).then(() => {
                        console.log('✅ 市值数据查询完成');
                        if (window.toastManager) {
                            window.toastManager.success('市值数据已更新');
                        }
                    });
                }
            } else {
                throw new Error(result.error || '搜索失败');
            }

        } catch (error) {
            console.error('搜索失败:', error);
            resultsContainer.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">❌</div>
                    <p class="error-text">搜索失败</p>
                    <p class="error-description">${error.message}</p>
                </div>
            `;

            if (window.toastManager) {
                window.toastManager.error('搜索失败，请稍后重试');
            }
        } finally {
            this.isSearching = false;
            searchBtn.disabled = false;
            searchBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
                </svg>
                搜索代币
            `;
        }
    }

    displaySearchResults(tokens, address) {
        const resultsContainer = this.container.querySelector('#search-results');

        if (tokens.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p class="empty-state-text">未找到代币</p>
                    <p class="empty-state-description">地址 ${this.formatAddress(address)} 尚未创建任何代币</p>
                </div>
            `;
            return;
        }

        this.currentTokens = tokens;

        let html = `
            <div class="search-results-header">
                <h4>搜索结果</h4>
                <p>地址 <code>${this.formatAddress(address)}</code> 创建了 <strong>${tokens.length}</strong> 个代币</p>
            </div>
            <div class="token-cards">
        `;

        tokens.forEach(token => {
            html += `
                <div class="token-card">
                    <div class="token-card-header">
                        <img src="${token.imageUrl || 'https://via.placeholder.com/48'}"
                             class="token-avatar" alt="${token.symbol}">
                        <div class="token-main-info">
                            <h5 class="token-name">${token.name}</h5>
                            <span class="token-symbol">${token.symbol}</span>
                        </div>
                        <span class="token-type-badge">${token.assetType || 'Token'}</span>
                    </div>
                    <div class="token-card-body">
                        <div class="token-stats">
                            <div class="token-stat">
                                <span class="stat-label">市值</span>
                                <span class="stat-value">$${this.formatNumber(token.marketCap || 0)}</span>
                            </div>
                            <div class="token-stat">
                                <span class="stat-label">持有者</span>
                                <span class="stat-value">${this.formatNumber(token.holders || 0)}</span>
                            </div>
                            <div class="token-stat">
                                <span class="stat-label">24H量</span>
                                <span class="stat-value">$${this.formatNumber(token.volume24h || 0)}</span>
                            </div>
                        </div>
                        <div class="token-address-display">
                            <span class="address-label">地址:</span>
                            <code class="token-address-code">${this.formatAddress(token.address)}</code>
                            <button class="copy-address-btn" data-address="${token.address}" title="复制地址">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="token-card-footer">
                        <button class="btn btn-sm btn-secondary view-token-btn" data-address="${token.address}">
                            查看详情
                        </button>
                        <button class="btn btn-sm btn-primary add-to-whitelist-btn" data-address="${token.address}" data-name="${token.name}">
                            添加到监控
                        </button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        resultsContainer.innerHTML = html;

        // 绑定复制按钮事件
        this.container.querySelectorAll('.copy-address-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const address = btn.dataset.address;
                navigator.clipboard.writeText(address).then(() => {
                    if (window.toastManager) {
                        window.toastManager.success('地址已复制到剪贴板');
                    }
                });
            });
        });

        // 绑定添加到白名单按钮
        this.container.querySelectorAll('.add-to-whitelist-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const address = btn.dataset.address;
                const name = btn.dataset.name;
                this.addToWhitelist(address, name);
            });
        });
    }

    setupWhitelistListeners() {
        const addBtn = this.container.querySelector('#add-address-btn');
        const saveThresholdBtn = this.container.querySelector('#save-threshold-btn');
        const exportBtn = this.container.querySelector('#export-whitelist-btn');
        const importBtn = this.container.querySelector('#import-whitelist-btn');
        const fileInput = this.container.querySelector('#import-file-input');

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const addressInput = this.container.querySelector('#whitelist-address');
                const labelInput = this.container.querySelector('#address-label');

                const address = addressInput.value.trim();
                const label = labelInput.value.trim();

                if (!this.validateSolanaAddress(address)) {
                    if (window.toastManager) {
                        window.toastManager.error('请输入有效的Solana钱包地址');
                    }
                    return;
                }

                this.addToWhitelist(address, label);
                addressInput.value = '';
                labelInput.value = '';
            });
        }

        if (saveThresholdBtn) {
            saveThresholdBtn.addEventListener('click', () => {
                this.saveThresholds();
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportWhitelist();
            });
        }

        if (importBtn && fileInput) {
            importBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.importWhitelist(file);
                }
            });
        }

        // 删除按钮事件委托
        const whitelistContainer = this.container.querySelector('#whitelist-list');
        if (whitelistContainer) {
            whitelistContainer.addEventListener('click', (e) => {
                const removeBtn = e.target.closest('.remove-whitelist-btn');
                if (removeBtn) {
                    const index = parseInt(removeBtn.dataset.index);
                    this.removeFromWhitelist(index);
                }
            });
        }
    }

    addToWhitelist(address, label = '') {
        // 检查是否已存在
        const exists = this.whitelist.some(item => item.address === address);
        if (exists) {
            if (window.toastManager) {
                window.toastManager.warning('该地址已在白名单中');
            }
            return;
        }

        this.whitelist.push({ address, label: label || '未命名开发者' });
        localStorage.setItem('devHunter_whitelist', JSON.stringify(this.whitelist));

        // 刷新列表显示
        const whitelistContainer = this.container.querySelector('#whitelist-list');
        if (whitelistContainer) {
            whitelistContainer.innerHTML = this.renderWhitelistItems();
        }

        if (window.toastManager) {
            window.toastManager.success('已添加到白名单');
        }
    }

    removeFromWhitelist(index) {
        this.whitelist.splice(index, 1);
        localStorage.setItem('devHunter_whitelist', JSON.stringify(this.whitelist));

        const whitelistContainer = this.container.querySelector('#whitelist-list');
        if (whitelistContainer) {
            whitelistContainer.innerHTML = this.renderWhitelistItems();
        }

        if (window.toastManager) {
            window.toastManager.success('已从白名单移除');
        }
    }

    saveThresholds() {
        this.thresholds = {
            marketCap: parseFloat(this.container.querySelector('#market-cap-threshold').value) || 100000,
            holderCount: parseInt(this.container.querySelector('#holder-count-threshold').value) || 100,
            volume: parseFloat(this.container.querySelector('#volume-threshold').value) || 10000,
            priceChange: parseFloat(this.container.querySelector('#price-change-threshold').value) || 50
        };

        localStorage.setItem('devHunter_thresholds', JSON.stringify(this.thresholds));

        if (window.toastManager) {
            window.toastManager.success('阈值设置已保存');
        }
    }

    exportWhitelist() {
        const data = JSON.stringify(this.whitelist, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devhunter-whitelist-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        if (window.toastManager) {
            window.toastManager.success('白名单已导出');
        }
    }

    importWhitelist(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    this.whitelist = imported;
                    localStorage.setItem('devHunter_whitelist', JSON.stringify(this.whitelist));

                    const whitelistContainer = this.container.querySelector('#whitelist-list');
                    if (whitelistContainer) {
                        whitelistContainer.innerHTML = this.renderWhitelistItems();
                    }

                    if (window.toastManager) {
                        window.toastManager.success(`已导入 ${imported.length} 个地址`);
                    }
                } else {
                    throw new Error('无效的文件格式');
                }
            } catch (error) {
                if (window.toastManager) {
                    window.toastManager.error('导入失败：' + error.message);
                }
            }
        };
        reader.readAsText(file);
    }

    setupTelegramListeners() {
        const testBtn = this.container.querySelector('#test-bot-btn');
        const saveBtn = this.container.querySelector('#save-telegram-btn');
        const startBtn = this.container.querySelector('#start-monitor-btn');
        const stopBtn = this.container.querySelector('#stop-monitor-btn');

        if (testBtn) {
            testBtn.addEventListener('click', () => {
                this.testTelegramConnection();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveTelegramConfig();
            });
        }

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startMonitoring();
            });
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.stopMonitoring();
            });
        }
    }

    async testTelegramConnection() {
        const botToken = this.container.querySelector('#bot-token').value.trim();
        const chatId = this.container.querySelector('#chat-id').value.trim();

        if (!botToken || !chatId) {
            if (window.toastManager) {
                window.toastManager.error('请填写Bot Token和Chat ID');
            }
            return;
        }

        if (window.toastManager) {
            window.toastManager.info('正在测试连接...');
        }

        try {
            const testMessage = '✅ *Dev Hunter 连接测试*\n\n连接成功！您的Telegram Bot已正确配置。';
            await this.sendTelegramMessage(testMessage, botToken, chatId);

            if (window.toastManager) {
                window.toastManager.success('连接测试成功！');
            }

            const statusValue = this.container.querySelector('#connection-status');
            if (statusValue) {
                statusValue.textContent = '已连接';
                statusValue.style.color = 'var(--color-success)';
            }
        } catch (error) {
            console.error('Telegram连接测试失败:', error);
            if (window.toastManager) {
                window.toastManager.error(`连接失败: ${error.message}`);
            }

            const statusValue = this.container.querySelector('#connection-status');
            if (statusValue) {
                statusValue.textContent = '连接失败';
                statusValue.style.color = 'var(--color-danger)';
            }
        }
    }

    saveTelegramConfig() {
        this.telegramConfig = {
            botToken: this.container.querySelector('#bot-token').value.trim(),
            chatId: this.container.querySelector('#chat-id').value.trim(),
            notifications: {
                newToken: this.container.querySelector('#notify-new-token').checked,
                threshold: this.container.querySelector('#notify-threshold').checked,
                priceChange: this.container.querySelector('#notify-price-change').checked,
                volumeSpike: this.container.querySelector('#notify-volume-spike').checked
            }
        };

        localStorage.setItem('devHunter_telegram', JSON.stringify(this.telegramConfig));

        if (window.toastManager) {
            window.toastManager.success('Telegram配置已保存');
        }
    }

    async startMonitoring() {
        if (this.whitelist.length === 0) {
            if (window.toastManager) {
                window.toastManager.warning('请先添加要监控的开发者地址');
            }
            return;
        }

        if (!this.telegramConfig.botToken || !this.telegramConfig.chatId) {
            if (window.toastManager) {
                window.toastManager.warning('请先配置Telegram Bot');
            }
            return;
        }

        if (this.isMonitoring) {
            if (window.toastManager) {
                window.toastManager.info('监控已在运行中');
            }
            return;
        }

        this.isMonitoring = true;

        // 更新UI状态
        const monitorStatus = this.container.querySelector('#monitor-status');
        if (monitorStatus) {
            monitorStatus.textContent = '监控中';
            monitorStatus.style.color = 'var(--color-success)';
        }

        // 发送启动通知
        try {
            const startMessage = `🚀 *Dev Hunter 监控已启动*\n\n监控地址数量: ${this.whitelist.length}\n检查间隔: ${this.telegramConfig.checkInterval}秒`;
            await this.sendTelegramMessage(startMessage);
        } catch (error) {
            console.error('发送启动消息失败:', error);
        }

        // 立即执行一次检查
        await this.performMonitoringCheck();

        // 设置定时检查
        const intervalMs = (this.telegramConfig.checkInterval || 60) * 1000;
        this.monitoringInterval = setInterval(async () => {
            await this.performMonitoringCheck();
        }, intervalMs);

        if (window.toastManager) {
            window.toastManager.success('监控已启动');
        }

        console.log(`✅ 监控已启动，检查间隔: ${this.telegramConfig.checkInterval}秒`);
    }

    async stopMonitoring() {
        if (!this.isMonitoring) {
            if (window.toastManager) {
                window.toastManager.info('监控未在运行');
            }
            return;
        }

        this.isMonitoring = false;

        // 清除定时器
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        // 更新UI状态
        const monitorStatus = this.container.querySelector('#monitor-status');
        if (monitorStatus) {
            monitorStatus.textContent = '已停止';
            monitorStatus.style.color = 'var(--text-tertiary)';
        }

        // 发送停止通知
        try {
            const stopMessage = '⏸️ *Dev Hunter 监控已停止*\n\n监控已暂停。';
            await this.sendTelegramMessage(stopMessage);
        } catch (error) {
            console.error('发送停止消息失败:', error);
        }

        if (window.toastManager) {
            window.toastManager.info('监控已停止');
        }

        console.log('⏸️ 监控已停止');
    }

    // 工具方法
    validateSolanaAddress(address) {
        if (!address || address.trim() === '') {
            return false;
        }

        const trimmedAddress = address.trim();

        // Solana地址长度应为32-44位字符
        if (trimmedAddress.length < 32 || trimmedAddress.length > 44) {
            return false;
        }

        // 验证是否只包含Base58字符
        if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmedAddress)) {
            return false;
        }

        return true;
    }

    formatAddress(address) {
        if (!address) return '';
        if (address.length <= 12) return address;
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    }

    // 更新单个代币卡片的市值数据
    updateTokenCard(token) {
        // 查找对应的代币卡片并更新市值显示
        const tokenCards = this.container.querySelectorAll('.token-card');
        tokenCards.forEach(card => {
            const addressDisplay = card.querySelector('.token-address-code');
            if (addressDisplay && addressDisplay.textContent.includes(token.address.slice(-6))) {
                // 找到匹配的卡片，更新市值数据
                const stats = card.querySelectorAll('.stat-value');
                if (stats.length >= 3) {
                    stats[0].textContent = '$' + this.formatNumber(token.marketCap || 0);
                    stats[1].textContent = this.formatNumber(token.holders || 0);
                    stats[2].textContent = '$' + this.formatNumber(token.volume24h || 0);
                }
            }
        });
    }

    // Telegram Bot相关方法

    /**
     * 发送Telegram消息
     */
    async sendTelegramMessage(text, botToken = null, chatId = null) {
        const token = botToken || this.telegramConfig.botToken;
        const chat = chatId || this.telegramConfig.chatId;

        if (!token || !chat) {
            throw new Error('Bot Token 或 Chat ID 未配置');
        }

        try {
            const url = `https://api.telegram.org/bot${token}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: chat,
                    text: text,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                })
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error(data.description || 'Telegram API 错误');
            }

            return true;
        } catch (error) {
            console.error('发送消息失败:', error);
            throw error;
        }
    }

    /**
     * 检查阈值是否触发
     */
    checkThresholds(tokenData) {
        const alerts = [];

        if (tokenData.marketCap >= this.thresholds.marketCap) {
            alerts.push({
                type: 'market_cap',
                message: `市值达到 $${this.formatNumber(tokenData.marketCap)}`,
                threshold: this.thresholds.marketCap,
                current: tokenData.marketCap
            });
        }

        if (tokenData.holders >= this.thresholds.holderCount) {
            alerts.push({
                type: 'holder_count',
                message: `持有者达到 ${tokenData.holders} 人`,
                threshold: this.thresholds.holderCount,
                current: tokenData.holders
            });
        }

        if (tokenData.volume24h >= this.thresholds.volume) {
            alerts.push({
                type: 'volume',
                message: `24h交易量达到 $${this.formatNumber(tokenData.volume24h)}`,
                threshold: this.thresholds.volume,
                current: tokenData.volume24h
            });
        }

        return alerts;
    }

    /**
     * 执行监控检查
     */
    async performMonitoringCheck() {
        if (!this.isMonitoring) return;

        try {
            console.log('🔍 执行监控检查...');
            this.updateLastCheck();

            // 检查每个白名单地址
            for (const whitelistItem of this.whitelist) {
                await this.checkWhitelistAddress(whitelistItem);
            }
        } catch (error) {
            console.error('监控检查失败:', error);
        }
    }

    /**
     * 检查白名单地址
     */
    async checkWhitelistAddress(whitelistItem) {
        try {
            // 获取该地址创建的代币
            const result = await this.heliusAPI.getTokensByCreator(whitelistItem.address);

            if (!result.success || result.tokens.length === 0) return;

            // 获取Token类型的代币
            const tokens = result.tokens.filter(t => t.assetType === 'Token');

            // 批量获取市值数据
            for (const token of tokens) {
                const marketData = await this.heliusAPI.getTokenMarketData(token.address);
                token.marketCap = marketData.marketCap;
                token.holders = marketData.holders;
                token.volume24h = marketData.volume24h;

                // 检查阈值
                const alerts = this.checkThresholds(token);

                // 发送警报
                for (const alert of alerts) {
                    if (this.shouldSendAlert(alert.type)) {
                        await this.sendAlertMessage(whitelistItem, token, alert);
                    }
                }

                // 延迟避免API限制
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.error(`检查地址 ${whitelistItem.address} 失败:`, error);
        }
    }

    /**
     * 判断是否应该发送警报
     */
    shouldSendAlert(alertType) {
        switch (alertType) {
            case 'market_cap': return this.telegramConfig.notifications.threshold;
            case 'holder_count': return this.telegramConfig.notifications.threshold;
            case 'volume': return this.telegramConfig.notifications.volumeSpike;
            case 'price_change': return this.telegramConfig.notifications.priceChange;
            default: return false;
        }
    }

    /**
     * 发送警报消息
     */
    async sendAlertMessage(whitelistItem, tokenData, alert) {
        const emoji = this.getAlertEmoji(alert.type);

        const message = `${emoji} *警报触发*\n\n` +
                       `🏷️ **${whitelistItem.label}**\n` +
                       `📍 开发者: \`${this.formatAddress(whitelistItem.address)}\`\n\n` +
                       `🪙 **代币: ${tokenData.name} (${tokenData.symbol})**\n` +
                       `📊 **${alert.message}**\n` +
                       `🎯 阈值: ${this.formatNumber(alert.threshold)}\n` +
                       `📈 当前: ${this.formatNumber(alert.current)}\n\n` +
                       `🔗 [查看Solscan](https://solscan.io/token/${tokenData.address})`;

        await this.sendTelegramMessage(message);
    }

    /**
     * 获取警报图标
     */
    getAlertEmoji(alertType) {
        const emojis = {
            market_cap: '💰',
            holder_count: '👥',
            volume: '📊',
            price_change: '📈'
        };
        return emojis[alertType] || '⚠️';
    }

    /**
     * 更新上次检查时间
     */
    updateLastCheck() {
        const element = this.container.querySelector('#last-check');
        if (element) {
            element.textContent = new Date().toLocaleString('zh-CN');
        }
    }
}
