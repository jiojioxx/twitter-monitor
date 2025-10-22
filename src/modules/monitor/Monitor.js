/**
 * Monitor Module
 */
class Monitor {
    constructor() {
        this.container = document.getElementById('monitor-module');
    }

    async init() {
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="monitor-page-layout">
                <!-- 左侧操作按钮区 -->
                <div class="monitor-sidebar">
                    <button class="sidebar-action-btn btn-primary" id="add-monitor-btn">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                        </svg>
                        <span>添加监控</span>
                    </button>
                    <button class="sidebar-action-btn btn-secondary" id="bulk-add-btn">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/>
                        </svg>
                        <span>批量添加</span>
                    </button>
                </div>

                <!-- 主内容区 -->
                <div class="monitor-main-content">
                    <!-- 监控类型切换 -->
                    <div class="monitor-type-tabs">
                        <button class="type-tab active" data-type="twitter" id="twitter-tab">
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"/>
                            </svg>
                            <span>推特监控</span>
                        </button>
                        <button class="type-tab" data-type="dev" id="dev-tab">
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                            </svg>
                            <span>Dev地址监控</span>
                        </button>
                    </div>

                    <!-- 监控列表标题 -->
                    <div class="monitor-list-header">
                        <h3 class="list-title">监控列表 <span class="count">(0)</span></h3>
                    </div>

                    <!-- 监控列表内容 -->
                    <div class="monitor-list-container">
                        <div class="empty-state">
                            <div class="empty-state-icon">📭</div>
                            <p class="empty-state-text">暂无监控数据</p>
                            <p class="empty-state-hint">点击左侧"添加监控"开始监控</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const addBtn = this.container.querySelector('#add-monitor-btn');
        const bulkBtn = this.container.querySelector('#bulk-add-btn');
        const twitterTab = this.container.querySelector('#twitter-tab');
        const devTab = this.container.querySelector('#dev-tab');

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showAddMonitorModal();
            });
        }

        if (bulkBtn) {
            bulkBtn.addEventListener('click', () => {
                this.showBulkAddModal();
            });
        }

        if (twitterTab) {
            twitterTab.addEventListener('click', () => {
                this.switchMonitorType('twitter');
            });
        }

        if (devTab) {
            devTab.addEventListener('click', () => {
                this.switchMonitorType('dev');
            });
        }
    }

    switchMonitorType(type) {
        const tabs = this.container.querySelectorAll('.type-tab');
        tabs.forEach(tab => {
            if (tab.dataset.type === type) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        console.log('Switched to monitor type:', type);
        // TODO: Load different monitoring data based on type
    }

    showAddMonitorModal() {
        window.eventBus.emit('modal:open', {
            title: '添加监控',
            content: '添加监控功能开发中...'
        });
    }

    showBulkAddModal() {
        const modalContent = `
            <div class="bulk-add-modal">
                <div class="bulk-add-tabs">
                    <button class="bulk-tab active" data-tab="text">文本输入</button>
                    <button class="bulk-tab" data-tab="file">文件导入</button>
                </div>

                <div class="bulk-add-content">
                    <div class="bulk-tab-panel active" data-panel="text">
                        <label class="form-label">批量输入账号（每行一个）</label>
                        <textarea id="bulk-text-input" class="form-textarea" rows="10" placeholder="请输入Twitter账号或地址，每行一个&#10;例如：&#10;@elonmusk&#10;@BinanceChain&#10;0x742d35..."></textarea>
                    </div>

                    <div class="bulk-tab-panel" data-panel="file" style="display: none;">
                        <div class="file-upload-area" id="file-upload-area">
                            <input type="file" id="file-input" accept=".txt,.csv" style="display: none;">
                            <div class="upload-placeholder">
                                <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                                </svg>
                                <p>点击或拖拽文件到此处</p>
                                <p class="upload-hint">支持 .txt, .csv 格式</p>
                            </div>
                            <div class="file-info" id="file-info" style="display: none;"></div>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="window.modalManager.close()">取消</button>
                    <button class="btn btn-primary" id="bulk-submit-btn">确认添加</button>
                </div>
            </div>
        `;

        window.eventBus.emit('modal:open', {
            title: '批量添加监控',
            content: modalContent,
            onOpen: () => this.setupBulkAddHandlers()
        });
    }

    setupBulkAddHandlers() {
        // Tab切换
        document.querySelectorAll('.bulk-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                document.querySelectorAll('.bulk-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.bulk-tab-panel').forEach(p => p.style.display = 'none');
                e.target.classList.add('active');
                document.querySelector(`[data-panel="${tabName}"]`).style.display = 'block';
            });
        });

        // 文件上传
        const fileInput = document.getElementById('file-input');
        const uploadArea = document.getElementById('file-upload-area');
        const fileInfo = document.getElementById('file-info');

        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFile(e.target.files[0]);
            }
        });

        const handleFile = (file) => {
            const validTypes = ['text/plain', 'text/csv'];
            if (!validTypes.includes(file.type)) {
                alert('仅支持 .txt 或 .csv 文件');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                document.getElementById('bulk-text-input').value = content;
                fileInfo.style.display = 'block';
                fileInfo.innerHTML = `
                    <div class="file-success">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span>文件已加载：${file.name}</span>
                    </div>
                `;
            };
            reader.readAsText(file);
        };

        // 提交
        document.getElementById('bulk-submit-btn').addEventListener('click', () => {
            const text = document.getElementById('bulk-text-input').value;
            if (!text.trim()) {
                alert('请输入或导入账号数据');
                return;
            }
            const accounts = text.split('\n').filter(line => line.trim());
            console.log('批量添加账号：', accounts);
            alert(`成功添加 ${accounts.length} 个监控项`);
            window.modalManager.close();
        });
    }

    connectWallet(walletType) {
        window.eventBus.emit('wallet:connect:request', { type: walletType });
    }
}