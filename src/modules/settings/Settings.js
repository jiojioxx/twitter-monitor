/**
 * Settings Module - 通知设置
 */
class Settings {
    constructor() {
        this.container = document.getElementById('settings-module');
        this.soundOptions = [
            { id: 'default', name: '默认提示音', file: 'default.mp3' },
            { id: 'bell', name: '清脆铃声', file: 'bell.mp3' },
            { id: 'chime', name: '悦耳钟声', file: 'chime.mp3' },
            { id: 'pop', name: '轻快提示', file: 'pop.mp3' },
            { id: 'whistle', name: '口哨声', file: 'whistle.mp3' }
        ];
        this.selectedSound = 'default';
        this.customSound = null;
        this.volume = 80;
        this.websocketUrl = this.generateWebSocketUrl();
    }

    generateWebSocketUrl() {
        // 生成唯一的 WebSocket URL
        const randomId = Math.random().toString(36).substring(2, 15);
        return `wss://api.example.com/ws/${randomId}`;
    }

    async init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="settings-page">
                <div class="settings-header">
                    <div>
                        <h2 class="settings-title">通知设置</h2>
                        <p class="settings-subtitle">配置声音提醒和推送服务</p>
                    </div>
                    <button class="btn btn-primary" id="save-settings-top">保存设置</button>
                </div>

                <!-- 声音设置 -->
                <div class="settings-section">
                    <div class="section-header">
                        <h3 class="section-title">🔔 声音设置</h3>
                        <p class="section-description">选择通知提示音并调整音量</p>
                    </div>

                    <div class="settings-card">
                        <!-- 音频选择 -->
                        <div class="sound-options-grid">
                            ${this.soundOptions.map(sound => `
                                <label class="sound-option">
                                    <input type="radio" name="sound" value="${sound.id}" ${this.selectedSound === sound.id ? 'checked' : ''}>
                                    <div class="sound-option-content">
                                        <span class="sound-icon">🎵</span>
                                        <span class="sound-name">${sound.name}</span>
                                        <button class="sound-play-btn" data-sound="${sound.id}" type="button">▶️</button>
                                    </div>
                                </label>
                            `).join('')}

                            <!-- 自定义音频 -->
                            <label class="sound-option sound-option-custom">
                                <input type="radio" name="sound" value="custom" ${this.selectedSound === 'custom' ? 'checked' : ''}>
                                <div class="sound-option-content">
                                    <span class="sound-icon">📁</span>
                                    <span class="sound-name">自定义音频</span>
                                    <button class="sound-upload-btn" type="button">上传</button>
                                </div>
                                <input type="file" id="custom-sound-input" accept="audio/*" style="display: none;">
                            </label>
                        </div>

                        <!-- 音量控制 -->
                        <div class="volume-control">
                            <label class="volume-label">
                                <span>🔊 音量</span>
                                <span class="volume-value">${this.volume}%</span>
                            </label>
                            <input type="range" class="volume-slider" id="volume-slider" min="0" max="100" value="${this.volume}">
                        </div>

                        <!-- 测试按钮 -->
                        <button class="btn btn-secondary btn-test-sound" id="test-sound-btn">
                            <span>🎧</span>
                            <span>测试声音</span>
                        </button>
                    </div>
                </div>

                <!-- 通知服务设置 -->
                <div class="settings-section">
                    <div class="section-header">
                        <h3 class="section-title">📲 通知服务设置</h3>
                        <p class="section-description">配置各类推送通知服务</p>
                    </div>

                    <!-- Bark 推送 -->
                    <div class="settings-card">
                        <div class="service-header">
                            <div class="service-info">
                                <div class="service-icon" style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);">
                                    <svg viewBox="0 0 24 24" fill="white">
                                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 class="service-name">Bark 推送</h4>
                                    <p class="service-desc">iOS 设备推送通知</p>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="bark-enable">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="service-config" id="bark-config" style="display: none;">
                            <div class="form-group">
                                <label class="form-label">Bark URL</label>
                                <input type="text" class="form-input" placeholder="https://api.day.app/your_key" id="bark-url">
                            </div>
                            <button class="btn btn-primary btn-sm" id="bark-test">测试推送</button>
                        </div>
                    </div>

                    <!-- Telegram 推送 -->
                    <div class="settings-card">
                        <div class="service-header">
                            <div class="service-info">
                                <div class="service-icon" style="background: linear-gradient(135deg, #2AABEE 0%, #229ED9 100%);">
                                    <svg viewBox="0 0 24 24" fill="white">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.52-.47-.02-1.38-.27-2.05-.49-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.03-.74 4.04-1.76 6.73-2.92 8.08-3.49 3.85-1.61 4.65-1.89 5.17-1.9.11 0 .37.03.54.17.14.12.18.27.2.38-.01.06.01.24 0 .38z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 class="service-name">Telegram 推送</h4>
                                    <p class="service-desc">即时消息推送</p>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="telegram-enable">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="service-config" id="telegram-config" style="display: none;">
                            <div class="form-group">
                                <label class="form-label">Bot Token <span class="required">*</span></label>
                                <input type="text" class="form-input" placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz" id="telegram-token">
                            </div>
                            <div class="form-group">
                                <label class="form-label">频道/群组 ID <span class="required">*</span></label>
                                <input type="text" class="form-input" placeholder="@channel_name 或 -1001234567890" id="telegram-chat">
                            </div>
                            <div class="form-group">
                                <label class="form-label">话题 ID (可选)</label>
                                <input type="text" class="form-input" placeholder="超级群组中的话题 ID" id="telegram-topic">
                                <p class="form-hint">仅在超级群组中使用话题功能时需要填写</p>
                            </div>
                            <button class="btn btn-primary btn-sm" id="telegram-test">测试推送</button>
                        </div>
                    </div>

                    <!-- 飞书推送 -->
                    <div class="settings-card">
                        <div class="service-header">
                            <div class="service-info">
                                <div class="service-icon" style="background: linear-gradient(135deg, #00D6B9 0%, #00B8A9 100%);">
                                    <svg viewBox="0 0 24 24" fill="white">
                                        <path d="M19.5 3h-15C3.67 3 3 3.67 3 4.5v15c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zm-7 14.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                        <circle cx="12.5" cy="12.5" r="1.5"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 class="service-name">飞书 (Lark) 推送</h4>
                                    <p class="service-desc">企业协作平台通知</p>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="lark-enable">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="service-config" id="lark-config" style="display: none;">
                            <div class="form-group">
                                <label class="form-label">Webhook URL</label>
                                <input type="text" class="form-input" placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/your_hook" id="lark-webhook">
                            </div>
                            <button class="btn btn-primary btn-sm" id="lark-test">测试推送</button>
                        </div>
                    </div>

                    <!-- 钉钉推送 -->
                    <div class="settings-card">
                        <div class="service-header">
                            <div class="service-info">
                                <div class="service-icon" style="background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);">
                                    <svg viewBox="0 0 24 24" fill="white">
                                        <path d="M21.5 7h-5c-.28 0-.5.22-.5.5s.22.5.5.5h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm0 4h-5c-.28 0-.5.22-.5.5s.22.5.5.5h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm0 4h-5c-.28 0-.5.22-.5.5s.22.5.5.5h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zM9 17l-5.88-5.88c-.39-.39-.39-1.02 0-1.41L9 4l8 8-8 5z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 class="service-name">钉钉推送</h4>
                                    <p class="service-desc">企业办公平台通知</p>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="dingtalk-enable">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="service-config" id="dingtalk-config" style="display: none;">
                            <div class="form-group">
                                <label class="form-label">Webhook URL</label>
                                <input type="text" class="form-input" placeholder="https://oapi.dingtalk.com/robot/send?access_token=your_token" id="dingtalk-webhook">
                            </div>
                            <button class="btn btn-primary btn-sm" id="dingtalk-test">测试推送</button>
                        </div>
                    </div>

                    <!-- 专属 WebSocket 链接 -->
                    <div class="settings-card">
                        <div class="service-header">
                            <div class="service-info">
                                <div class="service-icon" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%);">
                                    <svg viewBox="0 0 24 24" fill="white">
                                        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 class="service-name">专属 WebSocket 链接</h4>
                                    <p class="service-desc">实时数据推送连接</p>
                                </div>
                            </div>
                        </div>

                        <div class="service-config" style="display: block;">
                            <div class="form-group">
                                <label class="form-label">WebSocket URL</label>
                                <div class="websocket-url-container">
                                    <input type="text" class="form-input" value="${this.websocketUrl}" id="websocket-url" readonly>
                                    <button class="btn btn-secondary btn-sm copy-btn" id="copy-ws-btn" title="复制链接">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                        </svg>
                                    </button>
                                </div>
                                <p class="form-hint">这是您的专属 WebSocket 连接地址，用于实时接收推送数据，由系统自动生成，不可编辑</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 保存按钮 -->
                <div class="settings-actions">
                    <button class="btn btn-secondary" id="reset-settings">重置设置</button>
                    <button class="btn btn-primary" id="save-settings">保存设置</button>
                </div>
            </div>
        `;
    }
    setupEventListeners() {
        // 声音选择
        const soundRadios = this.container.querySelectorAll('input[name="sound"]');
        soundRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectedSound = e.target.value;
                console.log('Selected sound:', this.selectedSound);
            });
        });

        // 播放声音按钮
        const playBtns = this.container.querySelectorAll('.sound-play-btn');
        playBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const soundId = e.target.dataset.sound;
                this.playSound(soundId);
            });
        });

        // 自定义音频上传
        const uploadBtn = this.container.querySelector('.sound-upload-btn');
        const customInput = this.container.querySelector('#custom-sound-input');

        if (uploadBtn && customInput) {
            uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                customInput.click();
            });

            customInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.customSound = file;
                    console.log('Custom sound uploaded:', file.name);
                    if (window.toastManager) {
                        window.toastManager.success(`已上传: ${file.name}`);
                    }
                }
            });
        }

        // 音量控制
        const volumeSlider = this.container.querySelector('#volume-slider');
        const volumeValue = this.container.querySelector('.volume-value');

        if (volumeSlider && volumeValue) {
            volumeSlider.addEventListener('input', (e) => {
                this.volume = e.target.value;
                volumeValue.textContent = `${this.volume}%`;
            });
        }

        // 测试声音
        const testBtn = this.container.querySelector('#test-sound-btn');
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                this.testSound();
            });
        }

        // 服务开关切换
        this.setupServiceToggle('bark');
        this.setupServiceToggle('telegram');
        this.setupServiceToggle('lark');
        this.setupServiceToggle('dingtalk');

        // 测试推送按钮
        this.setupTestButton('bark');
        this.setupTestButton('telegram');
        this.setupTestButton('lark');
        this.setupTestButton('dingtalk');

        // 复制 WebSocket URL
        const copyWsBtn = this.container.querySelector('#copy-ws-btn');
        if (copyWsBtn) {
            copyWsBtn.addEventListener('click', () => {
                this.copyWebSocketUrl();
            });
        }

        // 保存设置（顶部和底部按钮）
        const saveBtn = this.container.querySelector('#save-settings');
        const saveBtnTop = this.container.querySelector('#save-settings-top');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        if (saveBtnTop) {
            saveBtnTop.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // 重置设置
        const resetBtn = this.container.querySelector('#reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSettings();
            });
        }
    }

    setupServiceToggle(service) {
        const toggle = this.container.querySelector(`#${service}-enable`);
        const config = this.container.querySelector(`#${service}-config`);

        if (toggle && config) {
            toggle.addEventListener('change', (e) => {
                config.style.display = e.target.checked ? 'block' : 'none';
                console.log(`${service} enabled:`, e.target.checked);
            });
        }
    }

    setupTestButton(service) {
        const testBtn = this.container.querySelector(`#${service}-test`);
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                this.testNotification(service);
            });
        }
    }

    playSound(soundId) {
        console.log('Playing sound:', soundId);
        if (window.toastManager) {
            window.toastManager.info(`播放: ${soundId}`);
        }
    }

    testSound() {
        console.log('Testing sound:', this.selectedSound, 'Volume:', this.volume);
        if (window.toastManager) {
            window.toastManager.info(`测试声音: ${this.selectedSound} (音量 ${this.volume}%)`);
        }
    }

    testNotification(service) {
        console.log(`Testing ${service} notification...`);
        const config = this.getServiceConfig(service);

        if (!this.validateServiceConfig(service, config)) {
            if (window.toastManager) {
                window.toastManager.error('请填写完整的配置信息');
            }
            return;
        }

        if (window.toastManager) {
            window.toastManager.success(`${service} 测试通知已发送`);
        }
    }

    copyWebSocketUrl() {
        const wsInput = this.container.querySelector('#websocket-url');
        if (wsInput) {
            wsInput.select();
            document.execCommand('copy');

            if (window.toastManager) {
                window.toastManager.success('WebSocket URL 已复制到剪贴板');
            }
        }
    }

    getServiceConfig(service) {
        const config = {};
        switch (service) {
            case 'bark':
                config.url = this.container.querySelector('#bark-url')?.value;
                break;
            case 'telegram':
                config.token = this.container.querySelector('#telegram-token')?.value;
                config.chatId = this.container.querySelector('#telegram-chat')?.value;
                config.topicId = this.container.querySelector('#telegram-topic')?.value;
                break;
            case 'lark':
                config.webhook = this.container.querySelector('#lark-webhook')?.value;
                break;
            case 'dingtalk':
                config.webhook = this.container.querySelector('#dingtalk-webhook')?.value;
                break;
        }
        return config;
    }

    validateServiceConfig(service, config) {
        switch (service) {
            case 'bark':
                return config.url && config.url.trim() !== '';
            case 'telegram':
                return config.token && config.chatId;
            case 'lark':
            case 'dingtalk':
                return config.webhook && config.webhook.trim() !== '';
            default:
                return false;
        }
    }

    saveSettings() {
        const settings = {
            sound: {
                selected: this.selectedSound,
                volume: this.volume,
                customSound: this.customSound?.name
            },
            services: {
                bark: {
                    enabled: this.container.querySelector('#bark-enable')?.checked,
                    ...this.getServiceConfig('bark')
                },
                telegram: {
                    enabled: this.container.querySelector('#telegram-enable')?.checked,
                    ...this.getServiceConfig('telegram')
                },
                lark: {
                    enabled: this.container.querySelector('#lark-enable')?.checked,
                    ...this.getServiceConfig('lark')
                },
                dingtalk: {
                    enabled: this.container.querySelector('#dingtalk-enable')?.checked,
                    ...this.getServiceConfig('dingtalk')
                }
            },
            websocketUrl: this.websocketUrl
        };

        // TODO: 保存到 localStorage 或发送到服务器
        console.log('Settings:', settings);
        if (window.toastManager) {
            window.toastManager.success('设置已保存');
        }
    }

    resetSettings() {
        if (confirm('确定要重置所有设置吗？')) {
            this.selectedSound = 'default';
            this.customSound = null;
            this.volume = 80;
            this.render();
            this.setupEventListeners();
            if (window.toastManager) {
                window.toastManager.success('设置已重置');
            }
        }
    }
}
