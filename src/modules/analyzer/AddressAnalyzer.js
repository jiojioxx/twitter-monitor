/**
 * AddressAnalyzer Module - 地址关系分析
 * 复刻自 GoPlus Radar
 */

class AddressAnalyzer {
    constructor() {
        this.container = document.getElementById('analyzer-module');
        this.analyzerAPI = new AnalyzerAPI();
        this.addresses = [];
        this.isAnalyzing = false;
        this.currentResult = null;
        this.expandedRows = new Set();
    }

    /**
     * 初始化模块
     */
    async init() {
        console.log('AddressAnalyzer initializing...');
        this.render();
        this.setupEventListeners();
    }

    /**
     * 渲染主界面
     */
    render() {
        this.container.innerHTML = `
            <div class="analyzer-page">
                <div class="page-header">
                    <h2>🔍 地址关系分析</h2>
                    <p class="page-description">分析2-5个Solana地址之间的关联关系</p>
                </div>

                <div class="analyzer-container">
                    <!-- 地址输入区域 -->
                    <div class="analyzer-section">
                        <div class="section-header">
                            <h3 class="section-title">输入地址</h3>
                            <p class="section-description">请输入2-5个Solana地址进行分析</p>
                        </div>

                        <div class="address-input-card">
                            <div class="input-group">
                                <input type="text"
                                       id="address-input"
                                       class="form-input"
                                       placeholder="输入Solana地址 (32-44位字符)"
                                       maxlength="44">
                                <button class="btn btn-primary" id="add-address-btn">
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                                    </svg>
                                    添加地址
                                </button>
                            </div>

                            <!-- 快速测试地址 -->
                            <div class="test-addresses">
                                <span class="test-label">快速测试:</span>
                                <button class="btn btn-sm btn-secondary test-address-btn"
                                        data-address="CZubgcMZ6Lx3QUNbCsq4ibKLDzzG4Hkn72ULZ2CojUiw">测试地址1</button>
                                <button class="btn btn-sm btn-secondary test-address-btn"
                                        data-address="CYxVq9uQzBw8pH4NLq9259jm7JxfjL11hhiFLboczdZ1">测试地址2</button>
                            </div>

                            <!-- 地址列表 -->
                            <div id="address-list" class="address-list">
                                <div class="empty-state">
                                    <div class="empty-icon">📋</div>
                                    <p>暂无地址</p>
                                    <small>添加至少2个地址开始分析</small>
                                </div>
                            </div>

                            <!-- 操作按钮 -->
                            <div class="button-group">
                                <button class="btn btn-success" id="analyze-btn" disabled>
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                        <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                                    </svg>
                                    开始分析
                                </button>
                                <button class="btn btn-secondary" id="reset-btn">
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                                    </svg>
                                    重置
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 分析结果区域 -->
                    <div id="analysis-result" class="analyzer-section" style="display: none;">
                        <!-- 结果将动态插入这里 -->
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        const addressInput = this.container.querySelector('#address-input');
        const addBtn = this.container.querySelector('#add-address-btn');
        const analyzeBtn = this.container.querySelector('#analyze-btn');
        const resetBtn = this.container.querySelector('#reset-btn');
        const testButtons = this.container.querySelectorAll('.test-address-btn');

        // 添加地址
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addAddress());
        }

        // 回车添加地址
        if (addressInput) {
            addressInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addAddress();
                }
            });
        }

        // 开始分析
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.performAnalysis());
        }

        // 重置
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }

        // 测试按钮
        testButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const address = btn.dataset.address;
                addressInput.value = address;
                this.addAddress();
            });
        });
    }

    /**
     * 添加地址
     */
    addAddress() {
        const input = this.container.querySelector('#address-input');
        const address = input.value.trim();

        // 验证地址
        if (!address) {
            if (window.toastManager) {
                window.toastManager.warning('请输入地址');
            }
            return;
        }

        if (!this.validateAddress(address)) {
            if (window.toastManager) {
                window.toastManager.error('请输入有效的Solana地址（32-44位字符）');
            }
            return;
        }

        if (this.addresses.includes(address)) {
            if (window.toastManager) {
                window.toastManager.warning('地址已存在');
            }
            return;
        }

        if (this.addresses.length >= 5) {
            if (window.toastManager) {
                window.toastManager.warning('最多支持5个地址');
            }
            return;
        }

        this.addresses.push(address);
        input.value = '';
        this.updateAddressList();
        this.updateAnalyzeButton();

        if (window.toastManager) {
            window.toastManager.success('地址已添加');
        }
    }

    /**
     * 验证地址格式
     */
    validateAddress(address) {
        if (!address || address.length < 32 || address.length > 44) {
            return false;
        }
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    }

    /**
     * 更新地址列表显示
     */
    updateAddressList() {
        const listContainer = this.container.querySelector('#address-list');

        if (this.addresses.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>暂无地址</p>
                    <small>添加至少2个地址开始分析</small>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = `
            <h4 style="margin-bottom: 0.75rem; color: var(--text-primary);">
                已添加的地址 (${this.addresses.length}/5)
            </h4>
            ${this.addresses.map((addr, index) => `
                <div class="address-item">
                    <span class="address-number">${index + 1}</span>
                    <span class="address-text" title="${addr}">
                        ${this.formatAddress(addr)}
                    </span>
                    <button class="btn btn-sm btn-danger remove-address-btn" data-index="${index}">
                        ✕
                    </button>
                </div>
            `).join('')}
        `;

        // 添加删除按钮事件
        listContainer.querySelectorAll('.remove-address-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.removeAddress(index);
            });
        });
    }

    /**
     * 删除地址
     */
    removeAddress(index) {
        this.addresses.splice(index, 1);
        this.updateAddressList();
        this.updateAnalyzeButton();
    }

    /**
     * 更新分析按钮状态
     */
    updateAnalyzeButton() {
        const analyzeBtn = this.container.querySelector('#analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.disabled = this.addresses.length < 2;
        }
    }

    /**
     * 执行分析
     */
    async performAnalysis() {
        if (this.isAnalyzing) return;
        if (this.addresses.length < 2) {
            if (window.toastManager) {
                window.toastManager.warning('至少需要2个地址');
            }
            return;
        }

        this.isAnalyzing = true;
        const analyzeBtn = this.container.querySelector('#analyze-btn');
        const resultContainer = this.container.querySelector('#analysis-result');

        // 更新按钮状态
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = `
            <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" stroke-opacity="0.25"/>
                <path d="M12 2 A10 10 0 0 1 22 12" stroke-width="4" stroke="currentColor" stroke-linecap="round"/>
            </svg>
            分析中...
        `;

        // 显示加载状态
        resultContainer.style.display = 'block';
        resultContainer.innerHTML = `
            <div class="loading-state">
                <div class="loader"></div>
                <p>正在分析 ${this.addresses.length} 个地址...</p>
                <small>这可能需要几分钟时间</small>
            </div>
        `;

        try {
            const result = await this.analyzerAPI.analyzeAddresses(this.addresses, 30);
            this.currentResult = result;
            this.displayResult(result);

            if (window.toastManager) {
                window.toastManager.success('分析完成！');
            }
        } catch (error) {
            console.error('分析失败:', error);
            resultContainer.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">❌</div>
                    <h4>分析失败</h4>
                    <p>${error.message || '未知错误'}</p>
                </div>
            `;

            if (window.toastManager) {
                window.toastManager.error(`分析失败: ${error.message}`);
            }
        } finally {
            this.isAnalyzing = false;
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                </svg>
                开始分析
            `;
        }
    }

    /**
     * 显示分析结果
     */
    displayResult(result) {
        const resultContainer = this.container.querySelector('#analysis-result');

        resultContainer.innerHTML = `
            <div class="section-header">
                <h3 class="section-title">分析结果</h3>
                <div class="analysis-meta">
                    <span>总体评分: <strong style="color: var(--color-primary);">${result.score}/10</strong></span>
                    <span>分析时间: ${new Date(result.analysis_time).toLocaleString('zh-CN')}</span>
                    <span>数据范围: 最近30天</span>
                </div>
            </div>

            <!-- 标签显示 -->
            <div class="tags-display">
                ${result.suggested_tags.map(tag => `
                    <span class="tag tag-${this.getTagClass(tag)}">${tag}</span>
                `).join('')}
            </div>

            <!-- 结果表格 -->
            <div class="result-table-container">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>地址对</th>
                            <th>评分</th>
                            <th>直接转账</th>
                            <th>间接路径</th>
                            <th>共同代币</th>
                            <th>30秒同步</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${result.pair_analysis.map((pair, index) => this.renderPairRow(pair, index)).join('')}
                    </tbody>
                </table>
            </div>

            <!-- 地址列表 -->
            <div class="analyzed-addresses">
                <h4>分析的地址列表</h4>
                ${result.analyzed_addresses.map((addr, i) => `
                    <div class="analyzed-address-item">
                        <span class="addr-label">地址${i + 1}:</span>
                        <span class="addr-value" title="${addr}">${addr}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // 添加展开/收起事件
        resultContainer.querySelectorAll('.expand-detail-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.toggleDetail(index);
            });
        });
    }

    /**
     * 渲染地址对行
     */
    renderPairRow(pair, index) {
        const [addr1, addr2] = pair.addresses;
        const syncCount = pair.common_tokens?.tokens_with_time_correlation || 0;

        let html = `
            <tr class="${pair.score >= 5 ? 'has-relation' : ''}">
                <td>
                    <div class="address-pair">
                        <span>${this.formatAddress(addr1)}</span>
                        <span class="pair-arrow">↔</span>
                        <span>${this.formatAddress(addr2)}</span>
                    </div>
                </td>
                <td class="score-cell">
                    <span class="score score-${this.getScoreClass(pair.score)}">${pair.score}/10</span>
                </td>
                <td class="center">
                    ${pair.direct_transfer?.exists ?
                        `<span class="indicator yes">✓ ${pair.direct_transfer.count}次</span>` :
                        '<span class="indicator no">-</span>'}
                </td>
                <td class="center">
                    ${pair.indirect_transfer?.exists ?
                        `<span class="indicator yes">${pair.indirect_transfer.paths_count}条</span>` :
                        '<span class="indicator no">-</span>'}
                </td>
                <td class="center">
                    ${pair.common_tokens?.common_tokens_count || 0}
                </td>
                <td class="center">
                    ${syncCount > 0 ?
                        `<span class="sync-badge">${syncCount}</span>` :
                        '-'}
                </td>
                <td class="center">
                    <button class="btn btn-sm btn-primary expand-detail-btn" data-index="${index}">
                        ${this.expandedRows.has(index) ? '收起' : '详情'}
                    </button>
                </td>
            </tr>
        `;

        // 如果展开，添加详情行
        if (this.expandedRows.has(index)) {
            html += `
                <tr class="detail-row">
                    <td colspan="7">
                        ${this.renderPairDetail(pair)}
                    </td>
                </tr>
            `;
        }

        return html;
    }

    /**
     * 渲染地址对详情
     */
    renderPairDetail(pair) {
        const [addr1, addr2] = pair.addresses;
        let html = '<div class="detail-content">';

        // 共同代币详情
        if (pair.common_tokens?.tokens && pair.common_tokens.tokens.length > 0) {
            html += `
                <div class="detail-section">
                    <h4>💰 共同代币交易</h4>
                    <div class="tokens-list">
                        ${pair.common_tokens.tokens.map(token => `
                            <div class="token-detail-card">
                                <div class="token-header">
                                    <strong>${token.token_symbol}</strong>
                                    <small>${this.formatAddress(token.token_address)}</small>
                                </div>
                                <div class="token-stats">
                                    <div>
                                        <span class="stat-label">${this.formatAddress(addr1)}:</span>
                                        <span class="stat-value">${token.addr1_purchases}次 (${this.formatAmount(token.addr1_total_amount)})</span>
                                    </div>
                                    <div>
                                        <span class="stat-label">${this.formatAddress(addr2)}:</span>
                                        <span class="stat-value">${token.addr2_purchases}次 (${this.formatAmount(token.addr2_total_amount)})</span>
                                    </div>
                                </div>
                                ${token.time_correlations && token.time_correlations.length > 0 ? `
                                    <div class="time-correlations">
                                        <strong>⏰ 时间相关交易:</strong>
                                        ${token.time_correlations.map(corr => `
                                            <div class="correlation-item">
                                                <span class="time-badge">${corr.time_diff_readable}</span>
                                                <small>
                                                    ${this.formatAddress(addr1)}: ${this.formatAmount(corr.addr1_purchase.amount)} @ ${corr.addr1_purchase.time}
                                                    <br>
                                                    ${this.formatAddress(addr2)}: ${this.formatAmount(corr.addr2_purchase.amount)} @ ${corr.addr2_purchase.time}
                                                </small>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // 直接转账详情
        if (pair.direct_transfer?.exists) {
            html += `
                <div class="detail-section">
                    <h4>💸 直接转账记录</h4>
                    <div class="transfers-list">
                        ${pair.direct_transfer.transfers_1_to_2?.length > 0 ? `
                            <div>
                                <strong>${this.formatAddress(addr1)} → ${this.formatAddress(addr2)}</strong>
                                ${pair.direct_transfer.transfers_1_to_2.map(tx => `
                                    <div class="transfer-item">
                                        ${tx.amount.toFixed(4)} ${tx.token} - ${tx.time}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        ${pair.direct_transfer.transfers_2_to_1?.length > 0 ? `
                            <div>
                                <strong>${this.formatAddress(addr2)} → ${this.formatAddress(addr1)}</strong>
                                ${pair.direct_transfer.transfers_2_to_1.map(tx => `
                                    <div class="transfer-item">
                                        ${tx.amount.toFixed(4)} ${tx.token} - ${tx.time}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // 间接转账详情
        if (pair.indirect_transfer?.exists) {
            html += `
                <div class="detail-section">
                    <h4>🏦 间接转账路径 (共同交互地址)</h4>
                    <div class="paths-list">
                        ${pair.indirect_transfer.paths.map(path => `
                            <div class="path-item">
                                <span class="middle-addr" title="${path.middle_address}">
                                    ${this.formatAddress(path.middle_address)}
                                </span>
                                <span class="time-diff">${path.time_diff_readable}</span>
                                <small class="path-info">
                                    ${path.addr1_direction === 'out' ? '→' : '←'} ${this.formatAddress(addr1)} |
                                    ${path.addr2_direction === 'out' ? '→' : '←'} ${this.formatAddress(addr2)}
                                </small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    /**
     * 切换详情展开/收起
     */
    toggleDetail(index) {
        if (this.expandedRows.has(index)) {
            this.expandedRows.delete(index);
        } else {
            this.expandedRows.add(index);
        }
        this.displayResult(this.currentResult);
    }

    /**
     * 重置
     */
    reset() {
        this.addresses = [];
        this.currentResult = null;
        this.expandedRows.clear();
        this.updateAddressList();
        this.updateAnalyzeButton();

        const resultContainer = this.container.querySelector('#analysis-result');
        if (resultContainer) {
            resultContainer.style.display = 'none';
        }

        if (window.toastManager) {
            window.toastManager.info('已重置');
        }
    }

    /**
     * 工具方法
     */
    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    formatAmount(amount) {
        const absAmount = Math.abs(amount);
        if (absAmount > 1e9) return (absAmount / 1e9).toFixed(2) + 'B';
        if (absAmount > 1e6) return (absAmount / 1e6).toFixed(2) + 'M';
        if (absAmount > 1e3) return (absAmount / 1e3).toFixed(2) + 'K';
        return absAmount.toFixed(2);
    }

    getScoreClass(score) {
        if (score >= 8) return 'high';
        if (score >= 5) return 'medium';
        if (score >= 3) return 'low';
        return 'none';
    }

    getTagClass(tag) {
        if (tag.includes('高度')) return 'danger';
        if (tag.includes('疑似')) return 'warning';
        if (tag.includes('同步')) return 'info';
        if (tag.includes('直接')) return 'danger';
        return 'secondary';
    }
}
