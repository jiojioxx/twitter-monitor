/**
 * Dashboard Module
 */
class Dashboard {
    constructor() {
        this.container = document.getElementById('dashboard-module');
        this.stats = {
            totalTweets: 0,
            totalFollowing: 0,
            activeAlerts: 0,
            avgResponseTime: 0
        };
    }

    /**
     * Initialize dashboard
     */
    async init() {
        this.render();
        this.setupEventListeners();
        await this.loadData();
    }

    /**
     * Render dashboard
     */
    render() {
        this.container.innerHTML = `
            <div class="dashboard-header">
                <h1>仪表板</h1>
                <p class="text-muted">实时监控概览</p>
            </div>

            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-value" id="total-tweets">0</div>
                    <div class="stat-label">总推文数</div>
                    <div class="stat-change positive">
                        <span>↗️</span>
                        <span>+12%</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-value" id="total-following">0</div>
                    <div class="stat-label">关注用户</div>
                    <div class="stat-change positive">
                        <span>↗️</span>
                        <span>+5</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-value" id="active-alerts">0</div>
                    <div class="stat-label">活跃提醒</div>
                    <div class="stat-change negative">
                        <span>↘️</span>
                        <span>-2</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-value" id="avg-response-time">0s</div>
                    <div class="stat-label">平均响应时间</div>
                    <div class="stat-change positive">
                        <span>↗️</span>
                        <span>-0.3s</span>
                    </div>
                </div>
            </div>

            <div class="dashboard-content">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">最近活动</h3>
                        <button class="btn btn-secondary btn-sm">查看全部</button>
                    </div>
                    <div class="card-body">
                        <div class="activity-list" id="activity-list">
                            <div class="activity-item">
                                <div class="activity-icon">👤</div>
                                <div class="activity-content">
                                    <div class="activity-title">新增关注用户</div>
                                    <div class="activity-description">@elonmusk 已添加到关注列表</div>
                                    <div class="activity-time">2分钟前</div>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">📢</div>
                                <div class="activity-content">
                                    <div class="activity-title">新推文提醒</div>
                                    <div class="activity-description">检测到关键词 "Bitcoin" 相关推文</div>
                                    <div class="activity-time">5分钟前</div>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">⚡</div>
                                <div class="activity-content">
                                    <div class="activity-title">系统优化</div>
                                    <div class="activity-description">响应时间提升 20%</div>
                                    <div class="activity-time">1小时前</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">快速操作</h3>
                    </div>
                    <div class="card-body">
                        <div class="quick-actions">
                            <button class="btn btn-primary" id="add-follow-btn">
                                <span>👤</span>
                                添加关注
                            </button>
                            <button class="btn btn-secondary" id="add-keyword-btn">
                                <span>🔍</span>
                                添加关键词
                            </button>
                            <button class="btn btn-success" id="start-monitor-btn">
                                <span>▶️</span>
                                开始监控
                            </button>
                            <button class="btn btn-info" id="export-data-btn">
                                <span>📊</span>
                                导出数据
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Quick action buttons
        const addFollowBtn = this.container.querySelector('#add-follow-btn');
        const addKeywordBtn = this.container.querySelector('#add-keyword-btn');
        const startMonitorBtn = this.container.querySelector('#start-monitor-btn');
        const exportDataBtn = this.container.querySelector('#export-data-btn');

        addFollowBtn.addEventListener('click', () => this.handleAddFollow());
        addKeywordBtn.addEventListener('click', () => this.handleAddKeyword());
        startMonitorBtn.addEventListener('click', () => this.handleStartMonitor());
        exportDataBtn.addEventListener('click', () => this.handleExportData());

        // Listen for real-time updates
        window.eventBus.on('ws:tweet:new', (tweet) => {
            this.updateStats();
            this.addActivity('📢', '新推文提醒', `来自 @${tweet.username} 的新推文`);
        });

        window.eventBus.on('follow:added', (user) => {
            this.updateStats();
            this.addActivity('👤', '新增关注用户', `@${user.username} 已添加到关注列表`);
        });
    }

    /**
     * Load dashboard data
     */
    async loadData() {
        try {
            // Mock data for now
            await new Promise(resolve => setTimeout(resolve, 500));

            this.stats = {
                totalTweets: 15234,
                totalFollowing: 89,
                activeAlerts: 12,
                avgResponseTime: 1.2
            };

            this.updateStatsDisplay();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            window.toastManager?.error('加载数据失败');
        }
    }

    /**
     * Update stats display
     */
    updateStatsDisplay() {
        const totalTweetsEl = this.container.querySelector('#total-tweets');
        const totalFollowingEl = this.container.querySelector('#total-following');
        const activeAlertsEl = this.container.querySelector('#active-alerts');
        const avgResponseTimeEl = this.container.querySelector('#avg-response-time');

        this.animateCounter(totalTweetsEl, 0, this.stats.totalTweets, 2000);
        this.animateCounter(totalFollowingEl, 0, this.stats.totalFollowing, 1500);
        this.animateCounter(activeAlertsEl, 0, this.stats.activeAlerts, 1000);

        avgResponseTimeEl.textContent = `${this.stats.avgResponseTime}s`;
    }

    /**
     * Animate counter
     */
    animateCounter(element, start, end, duration) {
        let startTimestamp = null;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);

            element.textContent = Helpers.formatNumber(current);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }

    /**
     * Update stats
     */
    updateStats() {
        this.stats.totalTweets++;
        this.updateStatsDisplay();
    }

    /**
     * Add activity
     */
    addActivity(icon, title, description) {
        const activityList = this.container.querySelector('#activity-list');
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">${icon}</div>
            <div class="activity-content">
                <div class="activity-title">${title}</div>
                <div class="activity-description">${description}</div>
                <div class="activity-time">刚刚</div>
            </div>
        `;

        activityList.insertBefore(activityItem, activityList.firstChild);

        // Remove old items if too many
        const items = activityList.querySelectorAll('.activity-item');
        if (items.length > 5) {
            items[items.length - 1].remove();
        }
    }

    /**
     * Handle add follow
     */
    async handleAddFollow() {
        const username = prompt('请输入要关注的Twitter用户名:');
        if (username && Validators.username(username)) {
            window.toastManager?.success(`已添加关注: @${username}`);
            this.addActivity('👤', '新增关注用户', `@${username} 已添加到关注列表`);
            window.eventBus.emit('follow:added', { username });
        }
    }

    /**
     * Handle add keyword
     */
    async handleAddKeyword() {
        const keyword = prompt('请输入要监控的关键词:');
        if (keyword && Validators.keyword(keyword)) {
            window.toastManager?.success(`已添加关键词: ${keyword}`);
            this.addActivity('🔍', '新增监控关键词', `关键词 "${keyword}" 已添加`);
        }
    }

    /**
     * Handle start monitor
     */
    async handleStartMonitor() {
        window.eventBus.emit('navigate', 'monitor');
        window.toastManager?.info('跳转到监控页面');
    }

    /**
     * Handle export data
     */
    async handleExportData() {
        window.toastManager?.info('数据导出功能开发中...');
    }

    /**
     * Refresh dashboard
     */
    async refresh() {
        await this.loadData();
    }
}