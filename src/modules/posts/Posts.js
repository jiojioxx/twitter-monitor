/**
 * Posts Module - 其他平台
 */
class Posts {
    constructor() {
        this.container = document.getElementById('posts-module');
        this.platforms = [
            // 交易所上币监控
            { name: 'Aster', key: 'aster', type: 'exchange', logo: this.getAsterLogo() },
            { name: 'Coinbase', key: 'coinbase', type: 'exchange', logo: this.getCoinbaseLogo() },
            { name: 'Upbit', key: 'upbit', type: 'exchange', logo: this.getUpbitLogo() },
            { name: '币安', key: 'binance', type: 'exchange', logo: this.getBinanceLogo() },
            { name: '欧意', key: 'okx', type: 'exchange', logo: this.getOKXLogo() },
            // 社交平台
            { name: '币安广场', key: 'binance-square', type: 'social', logo: this.getBinanceSquareLogo() },
            { name: '真相社交', key: 'truth-social', type: 'social', logo: this.getTruthSocialLogo() },
            { name: '微博', key: 'weibo', type: 'social', logo: this.getWeiboLogo() }
        ];
        this.selectedPlatforms = ['all']; // 默认选中"所有平台"
        this.posts = []; // 帖子信息流数据
    }

    // Platform logos as SVG
    getBinanceLogo() {
        return `<svg viewBox="0 0 126.61 126.61" fill="#F3BA2F"><path d="M38.73 53.2l24.59-24.58 24.6 24.6 14.3-14.31L63.32 0 24.43 38.89zm-38.73 10.1L14.31 49 0 34.69l14.31-14.3L28.62 34.7zm52.62 52.63l24.59-24.6 14.3 14.32-38.89 38.88-38.89-38.88 14.31-14.32zm0-38.89l24.59 24.58 14.3-14.3-38.89-38.9-38.89 38.9 14.31 14.3z"/></svg>`;
    }

    getBinanceSquareLogo() {
        return `<svg viewBox="0 0 126.61 126.61" fill="#F3BA2F"><path d="M38.73 53.2l24.59-24.58 24.6 24.6 14.3-14.31L63.32 0 24.43 38.89zm-38.73 10.1L14.31 49 0 34.69l14.31-14.3L28.62 34.7zm52.62 52.63l24.59-24.6 14.3 14.32-38.89 38.88-38.89-38.88 14.31-14.32zm0-38.89l24.59 24.58 14.3-14.3-38.89-38.9-38.89 38.9 14.31 14.3z"/></svg>`;
    }

    getCoinbaseLogo() {
        return `<svg viewBox="0 0 128 128" fill="#0052FF"><circle cx="64" cy="64" r="64"/><path fill="#fff" d="M64 28c-19.88 0-36 16.12-36 36s16.12 36 36 36 36-16.12 36-36-16.12-36-36-36zm17 41H53c-1.66 0-3-1.34-3-3v-8c0-1.66 1.34-3 3-3h28c1.66 0 3 1.34 3 3v8c0 1.66-1.34 3-3 3z"/></svg>`;
    }

    getOKXLogo() {
        return `<svg viewBox="0 0 28 28" fill="currentColor"><path d="M18.67 9.33h9.33v9.34h-9.33zM9.33 0h9.34v9.33h-9.34zM9.33 18.67h9.34V28h-9.34zM0 9.33h9.33v9.34H0z"/></svg>`;
    }

    getUpbitLogo() {
        return `<svg viewBox="0 0 200 200" fill="#0061FF"><path d="M100 0L0 50v100l100 50 100-50V50L100 0zm60 130l-60 30-60-30V70l60-30 60 30v60z"/></svg>`;
    }

    getAsterLogo() {
        return `<svg viewBox="0 0 24 24" fill="#FF6B35"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    }

    getTruthSocialLogo() {
        return `<svg viewBox="0 0 24 24" fill="#FF0000"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`;
    }

    getWeiboLogo() {
        return `<svg viewBox="0 0 24 24" fill="#E6162D"><path d="M9.68 14.89c-2.67 0-4.83-1.77-4.83-3.96 0-2.18 2.16-3.95 4.83-3.95 2.66 0 4.82 1.77 4.82 3.95 0 2.19-2.16 3.96-4.82 3.96zm8.6-7.56c-.28-.09-.47-.15-.33-.54.32-.85.35-1.58.01-2.1-.64-.98-2.4-.93-4.42-.03 0 0-.64.29-.47-.23.31-.51.52-1.15.52-1.67 0-1.23-1.15-1.9-2.87-1.9-2.83 0-5.13 1.88-5.13 4.2 0 2.47 2.24 3.98 5.48 3.98 3.97 0 6.61-2.3 6.61-4.13 0-1.1-.83-1.73-1.4-1.58zM18 6.34c1.4 0 2.44.59 2.91 1.65.47 1.06.34 2.28-.36 3.42-.15.24-.06.56.19.71.24.15.56.06.71-.19.88-1.43 1.04-2.99.45-4.37-.59-1.37-1.84-2.22-3.51-2.22-.28 0-.51.23-.51.51s.23.51.51.51z"/></svg>`;
    }

    async init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="posts-page">
                <div class="posts-header">
                    <h2 class="posts-title">所有平台</h2>

                    <!-- 平台筛选按钮组（紧凑型） -->
                    <div class="platform-filter-bar">
                        <button class="platform-filter-btn-compact active" data-platform="all" title="所有平台">
                            <span class="filter-icon">🌐</span>
                            <span class="filter-text">全部</span>
                        </button>
                        ${this.platforms.map(platform => `
                            <button class="platform-filter-btn-compact" data-platform="${platform.key}" title="${platform.name}${platform.type === 'exchange' ? ' - 交易所上币' : ' - 社交平台'}">
                                <span class="filter-logo">${platform.logo}</span>
                                <span class="filter-text">${platform.name}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- 帖子信息流 -->
                <div class="posts-feed">
                    ${this.posts.length === 0 ? this.renderEmptyState() : this.renderPosts()}
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p class="empty-state-text">暂无帖子信息</p>
                <p class="empty-state-description">选择平台后，相关帖子将实时显示在这里</p>
            </div>
        `;
    }

    renderPosts() {
        return `
            <div class="posts-list">
                ${this.posts.map(post => this.renderPost(post)).join('')}
            </div>
        `;
    }

    renderPost(post) {
        return `
            <div class="post-item" data-platform="${post.platform}">
                <div class="post-header">
                    <div class="post-platform-badge">
                        <span class="platform-logo-small">${this.getPlatformLogo(post.platform)}</span>
                        <span class="platform-name-small">${this.getPlatformName(post.platform)}</span>
                    </div>
                    <span class="post-time">${post.time}</span>
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                    ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
                </div>
                <div class="post-actions">
                    <button class="post-action-btn">❤️ ${post.likes || 0}</button>
                    <button class="post-action-btn">💬 ${post.comments || 0}</button>
                    <button class="post-action-btn">🔄 ${post.shares || 0}</button>
                </div>
            </div>
        `;
    }

    getPlatformLogo(platformKey) {
        const platform = this.platforms.find(p => p.key === platformKey);
        return platform ? platform.logo : '📱';
    }

    getPlatformName(platformKey) {
        const platform = this.platforms.find(p => p.key === platformKey);
        return platform ? platform.name : platformKey;
    }

    setupEventListeners() {
        // 平台筛选按钮 - "所有平台"与其他按钮互斥，其他按钮可多选
        const filterBtns = this.container.querySelectorAll('.platform-filter-btn-compact');
        const allBtn = this.container.querySelector('.platform-filter-btn-compact[data-platform="all"]');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clickedBtn = e.target.closest('.platform-filter-btn-compact');
                const platform = clickedBtn.dataset.platform;

                if (platform === 'all') {
                    // 点击"所有平台"：熄灭其他所有按钮，只亮"所有平台"
                    filterBtns.forEach(b => b.classList.remove('active'));
                    clickedBtn.classList.add('active');
                    this.selectedPlatforms = ['all'];
                } else {
                    // 点击其他按钮：自动熄灭"所有平台"
                    if (allBtn) {
                        allBtn.classList.remove('active');
                    }

                    // 切换当前按钮
                    clickedBtn.classList.toggle('active');

                    // 更新选中的平台列表
                    if (clickedBtn.classList.contains('active')) {
                        this.selectedPlatforms = this.selectedPlatforms.filter(p => p !== 'all');
                        if (!this.selectedPlatforms.includes(platform)) {
                            this.selectedPlatforms.push(platform);
                        }
                    } else {
                        this.selectedPlatforms = this.selectedPlatforms.filter(p => p !== platform);
                    }

                    // 如果所有其他按钮都熄灭了，自动点亮"所有平台"
                    const hasOtherActive = Array.from(filterBtns).some(b =>
                        b.dataset.platform !== 'all' && b.classList.contains('active')
                    );
                    if (!hasOtherActive && allBtn) {
                        allBtn.classList.add('active');
                        this.selectedPlatforms = ['all'];
                    }
                }

                this.filterPlatforms();
            });
        });
    }

    filterPlatforms() {
        console.log('Selected platforms:', this.selectedPlatforms);

        const postItems = this.container.querySelectorAll('.post-item');

        if (this.selectedPlatforms.includes('all')) {
            // 显示所有平台的帖子
            postItems.forEach(post => {
                post.style.display = 'block';
            });
        } else {
            // 只显示选中平台的帖子
            postItems.forEach(post => {
                const platform = post.dataset.platform;
                if (this.selectedPlatforms.includes(platform)) {
                    post.style.display = 'block';
                } else {
                    post.style.display = 'none';
                }
            });
        }
    }
}
