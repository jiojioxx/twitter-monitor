/**
 * Feed Module - 信息流
 */
class Feed {
    constructor() {
        this.container = document.getElementById('feed-module');
        this.feedItems = [];
    }

    async init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="feed-page">
                <div class="feed-header">
                    <h2 class="feed-title">信息流</h2>

                    <!-- 用户活动筛选器 -->
                    <div class="feed-activity-filter">
                        <label class="filter-label">用户活动</label>
                        <select class="activity-select" id="activity-select">
                            <option value="all">所有活动</option>
                            <option value="follow">关注</option>
                            <option value="nickname">改昵称</option>
                            <option value="username">改名</option>
                            <option value="avatar">改头像</option>
                            <option value="banner">改背景图</option>
                            <option value="bio">改简介</option>
                            <option value="unpin">取消置顶</option>
                            <option value="pin">新置顶</option>
                        </select>
                    </div>
                </div>

                <!-- 筛选选项组 -->
                <div class="feed-options">
                    <div class="feed-checkboxes">
                        <label class="checkbox-label">
                            <input type="checkbox" id="only-original" />
                            <span>只看原创</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="sound-alert" />
                            <span>🔔 声音提醒</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="voice-broadcast" />
                            <span>🔊 语音播报</span>
                        </label>
                    </div>

                    <!-- 类型筛选按钮组（多选） -->
                    <div class="feed-type-filters">
                        <button class="filter-btn active" data-filter="all">全部</button>
                        <button class="filter-btn" data-filter="tweets">推文</button>
                        <button class="filter-btn" data-filter="mentions">提及</button>
                        <button class="filter-btn" data-filter="retweets">转推</button>
                        <button class="filter-btn" data-filter="other-platforms">其他平台</button>
                    </div>
                </div>

                <div class="feed-content">
                    ${this.feedItems.length === 0 ? this.renderEmptyState() : this.renderFeedItems()}
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📡</div>
                <p class="empty-state-text">暂无信息流数据</p>
                <p class="empty-state-description">添加监控账号后，相关推文将实时显示在这里</p>
            </div>
        `;
    }

    renderFeedItems() {
        return `
            <div class="feed-list">
                ${this.feedItems.map(item => this.renderFeedItem(item)).join('')}
            </div>
        `;
    }

    renderFeedItem(item) {
        return `
            <div class="feed-item">
                <div class="feed-item-header">
                    <img src="${item.avatar}" alt="${item.username}" class="feed-avatar">
                    <div class="feed-user-info">
                        <span class="feed-username">${item.username}</span>
                        <span class="feed-handle">@${item.handle}</span>
                    </div>
                    <span class="feed-time">${item.time}</span>
                </div>
                <div class="feed-item-content">
                    <p>${item.content}</p>
                </div>
                <div class="feed-item-actions">
                    <button class="feed-action-btn">❤️ ${item.likes}</button>
                    <button class="feed-action-btn">🔄 ${item.retweets}</button>
                    <button class="feed-action-btn">💬 ${item.replies}</button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // 类型筛选按钮 - "全部"与其他按钮互斥，其他按钮可多选
        const filterBtns = this.container.querySelectorAll('.filter-btn');
        const allBtn = this.container.querySelector('.filter-btn[data-filter="all"]');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clickedBtn = e.target;
                const filter = clickedBtn.dataset.filter;

                if (filter === 'all') {
                    // 点击"全部"：熄灭其他所有按钮，只亮"全部"
                    filterBtns.forEach(b => b.classList.remove('active'));
                    clickedBtn.classList.add('active');
                } else {
                    // 点击其他按钮：自动熄灭"全部"
                    if (allBtn) {
                        allBtn.classList.remove('active');
                    }

                    // 切换当前按钮
                    clickedBtn.classList.toggle('active');

                    // 如果所有其他按钮都熄灭了，自动点亮"全部"
                    const hasOtherActive = Array.from(filterBtns).some(b =>
                        b.dataset.filter !== 'all' && b.classList.contains('active')
                    );
                    if (!hasOtherActive && allBtn) {
                        allBtn.classList.add('active');
                    }
                }

                this.filterFeed();
            });
        });

        // 用户活动下拉框
        const activitySelect = this.container.querySelector('#activity-select');
        if (activitySelect) {
            activitySelect.addEventListener('change', (e) => {
                console.log('用户活动筛选：', e.target.value);
                this.filterByActivity(e.target.value);
            });
        }

        // 复选框选项
        const onlyOriginal = this.container.querySelector('#only-original');
        const soundAlert = this.container.querySelector('#sound-alert');
        const voiceBroadcast = this.container.querySelector('#voice-broadcast');

        if (onlyOriginal) {
            onlyOriginal.addEventListener('change', (e) => {
                console.log('只看原创：', e.target.checked);
            });
        }

        if (soundAlert) {
            soundAlert.addEventListener('change', (e) => {
                console.log('声音提醒：', e.target.checked);
                if (e.target.checked) {
                    // TODO: 启用声音提醒功能
                }
            });
        }

        if (voiceBroadcast) {
            voiceBroadcast.addEventListener('change', (e) => {
                console.log('语音播报：', e.target.checked);
                if (e.target.checked) {
                    // TODO: 启用语音播报功能
                }
            });
        }
    }

    filterFeed() {
        // 获取所有激活的筛选器（支持多选）
        // 可选项：all（全部）, tweets（推文）, mentions（提及）, retweets（转推）, other-platforms（其他平台如微博等）
        const activeFilters = [];
        const filterBtns = this.container.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            if (btn.classList.contains('active')) {
                activeFilters.push(btn.dataset.filter);
            }
        });

        console.log('Filtering feed by:', activeFilters);
        // TODO: Implement filtering logic based on activeFilters array
        // 例如：可以只显示 other-platforms（屏蔽推特信息流，只看微博等其他平台）
    }

    filterByActivity(activity) {
        console.log('Filtering by activity:', activity);
        // TODO: Implement activity filtering
    }
}
