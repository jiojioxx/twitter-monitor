/**
 * 地址分析API - 核心分析逻辑
 * 复刻自 GoPlus Radar
 */

class AnalyzerAPI {
    constructor() {
        // 使用现有的Helius API Key
        this.apiKey = '7938b477-7c63-42a2-8a69-3a9e31aaf066';
        this.rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${this.apiKey}`;

        // 系统地址过滤列表（DEX/AMM等）
        this.systemAddresses = new Set([
            "6PFv6v5TCwREX38nMEHjG67awEwG2RuCLEfjqrWieBQg",  // pump.fun AMM
            "6HMoJqFfifATfSqD7YY3YXA3CZxwjfCwpExGEvQ5bekY",  // pump.fun related
            "GpMZbSM2GgvTKHJirzeGfMFoaZ8UR2X7F4v8vHTvxFbL",  // pump.fun related
            "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",   // Jupiter Aggregator
            "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",  // Orca
            "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",  // Raydium
            "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP",  // Orca V2
            "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",  // Raydium CLMM
            "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX"    // Serum
        ]);
    }

    /**
     * 分析多个地址的关系
     */
    async analyzeAddresses(addresses, days = 30) {
        console.log(`开始分析 ${addresses.length} 个地址...`);

        // 1. 获取所有地址的交易数据
        const addressDataMap = {};
        for (const address of addresses) {
            console.log(`获取地址 ${address} 的交易数据...`);
            addressDataMap[address] = await this.getAddressTransactions(address, days);
        }

        // 2. 分析每个地址对
        const pairAnalysis = [];
        for (let i = 0; i < addresses.length; i++) {
            for (let j = i + 1; j < addresses.length; j++) {
                const addr1 = addresses[i];
                const addr2 = addresses[j];
                console.log(`分析地址对: ${addr1.slice(0, 8)}... 和 ${addr2.slice(0, 8)}...`);

                const pairResult = await this.analyzePair(
                    addr1, addr2,
                    addressDataMap[addr1],
                    addressDataMap[addr2]
                );
                pairAnalysis.push(pairResult);
            }
        }

        // 3. 计算总体评分
        const avgScore = pairAnalysis.length > 0
            ? pairAnalysis.reduce((sum, p) => sum + p.score, 0) / pairAnalysis.length
            : 0;

        // 4. 生成建议标签
        const suggestedTags = this.generateTags(avgScore, pairAnalysis);

        return {
            score: parseFloat(avgScore.toFixed(1)),
            suggested_tags: suggestedTags,
            analyzed_addresses: addresses,
            analysis_time: new Date().toISOString(),
            pair_analysis: pairAnalysis,
            relationships: []  // 兼容性字段
        };
    }

    /**
     * 获取地址的交易记录
     */
    async getAddressTransactions(address, days = 30) {
        try {
            const before = null;  // 从最新开始
            const limit = 1000;   // 每次获取1000条

            const url = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${this.apiKey}&limit=${limit}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const transactions = await response.json();
            console.log(`获取到 ${transactions.length} 条交易`);

            // 转换为统一格式
            const processedTxs = this.processTransactions(address, transactions);

            return {
                address: address,
                transactions: processedTxs,
                total: processedTxs.length
            };
        } catch (error) {
            console.error(`获取地址 ${address} 交易失败:`, error);
            return {
                address: address,
                transactions: [],
                total: 0,
                error: error.message
            };
        }
    }

    /**
     * 处理交易数据
     */
    processTransactions(address, rawTransactions) {
        const processed = [];

        for (const tx of rawTransactions) {
            const timestamp = tx.timestamp;
            const signature = tx.signature;

            // 处理原生SOL转账
            if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
                for (const transfer of tx.nativeTransfers) {
                    processed.push({
                        hash: signature,
                        from_address: transfer.fromUserAccount,
                        to_address: transfer.toUserAccount,
                        amount: transfer.amount / 1e9,  // lamports to SOL
                        token_address: null,
                        token_symbol: 'SOL',
                        timestamp: timestamp,
                        type: 'native'
                    });
                }
            }

            // 处理代币转账
            if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
                for (const transfer of tx.tokenTransfers) {
                    processed.push({
                        hash: signature,
                        from_address: transfer.fromUserAccount,
                        to_address: transfer.toUserAccount,
                        amount: transfer.tokenAmount,
                        token_address: transfer.mint,
                        token_symbol: transfer.tokenSymbol || 'Unknown',
                        timestamp: timestamp,
                        type: 'token'
                    });
                }
            }
        }

        return processed;
    }

    /**
     * 分析两个地址之间的关系
     */
    async analyzePair(addr1, addr2, data1, data2) {
        const result = {
            addresses: [addr1, addr2],
            score: 0,
            direct_transfer: null,
            indirect_transfer: null,
            common_tokens: null
        };

        // 1. 检查直接转账
        const directTransfer = this.checkDirectTransfer(addr1, addr2, data1, data2);
        result.direct_transfer = directTransfer;

        if (directTransfer.exists) {
            result.score = 10;  // 直接转账10分
        }

        // 2. 检查间接转账
        const indirectTransfer = this.checkIndirectTransfer(addr1, addr2, data1, data2);
        result.indirect_transfer = indirectTransfer;

        // 3. 检查共同代币购买
        const commonTokens = this.checkCommonTokens(addr1, addr2, data1, data2);
        result.common_tokens = commonTokens;

        // 4. 计算评分（如果没有直接转账）
        if (result.score < 10) {
            let score = 0;

            // 间接转账评分
            if (indirectTransfer.exists && indirectTransfer.paths.length > 0) {
                const minTimeDiff = Math.min(...indirectTransfer.paths.map(p => p.time_diff));

                if (minTimeDiff < 30) score = 9;
                else if (minTimeDiff < 120) score = 8;
                else if (minTimeDiff < 600) score = 7;
                else if (minTimeDiff < 3600) score = 6;
                else score = 5;

                // 检查唯一中间地址数量
                const uniqueMiddle = new Set(indirectTransfer.paths.slice(0, 20).map(p => p.middle_address));
                if (uniqueMiddle.size === 1) score = Math.max(score - 2, 3);
                else if (uniqueMiddle.size === 2) score = Math.max(score - 1, 4);

                // 检查是否都是接收方（可能是空投）
                const allReceiving = indirectTransfer.paths.slice(0, 10).every(
                    p => p.addr1_direction === 'in' && p.addr2_direction === 'in'
                );
                if (allReceiving) score = Math.min(score - 4, 2);
            }

            // 代币购买评分
            if (commonTokens.tokens && commonTokens.tokens.length > 0) {
                const tokenCount = commonTokens.tokens.length;
                const timeCorrelated = commonTokens.tokens_with_time_correlation;

                const tokenBaseScore = 1;
                const tokenBonus = tokenCount * 0.2;
                const timeBonus = timeCorrelated * 0.3;

                const tokenScore = Math.min(tokenBaseScore + tokenBonus + timeBonus, 5);
                score = score + tokenScore;
            }

            result.score = Math.min(Math.max(Math.floor(score), 1), 9);
        }

        return result;
    }

    /**
     * 检查直接转账
     */
    checkDirectTransfer(addr1, addr2, data1, data2) {
        const transfers1to2 = [];
        const transfers2to1 = [];

        // 检查 addr1 -> addr2
        for (const tx of data1.transactions) {
            if (tx.from_address === addr1 && tx.to_address === addr2) {
                transfers1to2.push({
                    hash: tx.hash,
                    amount: tx.amount,
                    token: tx.token_symbol || 'SOL',
                    timestamp: tx.timestamp,
                    time: new Date(tx.timestamp * 1000).toLocaleString('zh-CN')
                });
            }
        }

        // 检查 addr2 -> addr1
        for (const tx of data2.transactions) {
            if (tx.from_address === addr2 && tx.to_address === addr1) {
                transfers2to1.push({
                    hash: tx.hash,
                    amount: tx.amount,
                    token: tx.token_symbol || 'SOL',
                    timestamp: tx.timestamp,
                    time: new Date(tx.timestamp * 1000).toLocaleString('zh-CN')
                });
            }
        }

        return {
            exists: transfers1to2.length > 0 || transfers2to1.length > 0,
            count: transfers1to2.length + transfers2to1.length,
            transfers_1_to_2: transfers1to2.slice(0, 5),
            transfers_2_to_1: transfers2to1.slice(0, 5),
            total_amount_1_to_2: transfers1to2.reduce((sum, t) => sum + t.amount, 0),
            total_amount_2_to_1: transfers2to1.reduce((sum, t) => sum + t.amount, 0)
        };
    }

    /**
     * 检查间接转账（通过中间地址）
     */
    checkIndirectTransfer(addr1, addr2, data1, data2) {
        // 获取两个地址的交互地址
        const addr1Interactions = new Map();
        const addr2Interactions = new Map();

        // 处理addr1的交互
        for (const tx of data1.transactions) {
            if (tx.from_address === addr1 && tx.to_address && tx.to_address !== addr2) {
                if (!this.systemAddresses.has(tx.to_address)) {
                    if (!addr1Interactions.has(tx.to_address)) {
                        addr1Interactions.set(tx.to_address, []);
                    }
                    addr1Interactions.get(tx.to_address).push({
                        timestamp: tx.timestamp,
                        direction: 'out',
                        amount: tx.amount
                    });
                }
            } else if (tx.to_address === addr1 && tx.from_address && tx.from_address !== addr2) {
                if (!this.systemAddresses.has(tx.from_address)) {
                    if (!addr1Interactions.has(tx.from_address)) {
                        addr1Interactions.set(tx.from_address, []);
                    }
                    addr1Interactions.get(tx.from_address).push({
                        timestamp: tx.timestamp,
                        direction: 'in',
                        amount: tx.amount
                    });
                }
            }
        }

        // 处理addr2的交互
        for (const tx of data2.transactions) {
            if (tx.from_address === addr2 && tx.to_address && tx.to_address !== addr1) {
                if (!this.systemAddresses.has(tx.to_address)) {
                    if (!addr2Interactions.has(tx.to_address)) {
                        addr2Interactions.set(tx.to_address, []);
                    }
                    addr2Interactions.get(tx.to_address).push({
                        timestamp: tx.timestamp,
                        direction: 'out',
                        amount: tx.amount
                    });
                }
            } else if (tx.to_address === addr2 && tx.from_address && tx.from_address !== addr1) {
                if (!this.systemAddresses.has(tx.from_address)) {
                    if (!addr2Interactions.has(tx.from_address)) {
                        addr2Interactions.set(tx.from_address, []);
                    }
                    addr2Interactions.get(tx.from_address).push({
                        timestamp: tx.timestamp,
                        direction: 'in',
                        amount: tx.amount
                    });
                }
            }
        }

        // 找出共同地址
        const commonAddresses = Array.from(addr1Interactions.keys()).filter(
            addr => addr2Interactions.has(addr)
        );

        // 分析时间相关性
        const indirectPaths = [];
        const timeWindow = 86400;  // 24小时

        for (const middleAddr of commonAddresses) {
            const interactions1 = addr1Interactions.get(middleAddr);
            const interactions2 = addr2Interactions.get(middleAddr);

            for (const i1 of interactions1) {
                for (const i2 of interactions2) {
                    const timeDiff = Math.abs(i1.timestamp - i2.timestamp);
                    if (timeDiff <= timeWindow) {
                        indirectPaths.push({
                            middle_address: middleAddr,
                            time_diff: timeDiff,
                            time_diff_readable: this.formatTimeDiff(timeDiff),
                            addr1_time: new Date(i1.timestamp * 1000).toLocaleString('zh-CN'),
                            addr2_time: new Date(i2.timestamp * 1000).toLocaleString('zh-CN'),
                            addr1_direction: i1.direction,
                            addr2_direction: i2.direction,
                            addr1_amount: i1.amount,
                            addr2_amount: i2.amount
                        });
                    }
                }
            }
        }

        // 按时间差排序
        indirectPaths.sort((a, b) => a.time_diff - b.time_diff);

        return {
            exists: indirectPaths.length > 0,
            paths_count: indirectPaths.length,
            common_addresses_count: commonAddresses.length,
            paths: indirectPaths.slice(0, 10)
        };
    }

    /**
     * 检查共同代币购买
     */
    checkCommonTokens(addr1, addr2, data1, data2) {
        // 获取代币购买记录
        const tokens1 = this.getTokenPurchases(addr1, data1);
        const tokens2 = this.getTokenPurchases(addr2, data2);

        // 找出共同代币
        const commonTokenAddrs = Array.from(tokens1.keys()).filter(
            token => tokens2.has(token)
        );

        const tokenAnalysis = [];

        for (const tokenAddr of commonTokenAddrs) {
            const purchases1 = tokens1.get(tokenAddr);
            const purchases2 = tokens2.get(tokenAddr);

            // 分析时间相关性
            const timeCorrelations = [];
            const seenPairs = new Set();

            for (const p1 of purchases1) {
                for (const p2 of purchases2) {
                    const pairId = [p1.tx_hash, p2.tx_hash].sort().join('_');
                    if (seenPairs.has(pairId)) continue;

                    const timeDiff = Math.abs(p1.timestamp - p2.timestamp);
                    if (timeDiff <= 3600) {  // 1小时内
                        seenPairs.add(pairId);
                        timeCorrelations.push({
                            time_diff: timeDiff,
                            time_diff_readable: this.formatTimeDiff(timeDiff),
                            addr1_purchase: {
                                amount: p1.amount,
                                time: new Date(p1.timestamp * 1000).toLocaleString('zh-CN'),
                                tx_hash: p1.tx_hash
                            },
                            addr2_purchase: {
                                amount: p2.amount,
                                time: new Date(p2.timestamp * 1000).toLocaleString('zh-CN'),
                                tx_hash: p2.tx_hash
                            }
                        });
                    }
                }
            }

            if (purchases1.length > 0 || purchases2.length > 0) {
                tokenAnalysis.push({
                    token_address: tokenAddr,
                    token_symbol: purchases1[0]?.token_symbol || purchases2[0]?.token_symbol || 'Unknown',
                    token_name: null,
                    token_icon: null,
                    addr1_purchases: purchases1.length,
                    addr2_purchases: purchases2.length,
                    addr1_total_amount: purchases1.reduce((sum, p) => sum + p.amount, 0),
                    addr2_total_amount: purchases2.reduce((sum, p) => sum + p.amount, 0),
                    time_correlations: timeCorrelations.sort((a, b) => a.time_diff - b.time_diff).slice(0, 5),
                    has_time_correlation: timeCorrelations.length > 0
                });
            }
        }

        // 按时间相关性排序
        tokenAnalysis.sort((a, b) => b.time_correlations.length - a.time_correlations.length);

        return {
            tokens: tokenAnalysis,
            common_tokens_count: commonTokenAddrs.length,
            tokens_with_time_correlation: tokenAnalysis.filter(t => t.has_time_correlation).length
        };
    }

    /**
     * 获取代币购买记录
     */
    getTokenPurchases(address, addressData) {
        const purchases = new Map();
        const seenTxs = new Set();

        for (const tx of addressData.transactions) {
            const txId = `${tx.hash}_${tx.token_address}_${tx.from_address}_${tx.to_address}_${tx.amount}`;
            if (seenTxs.has(txId)) continue;
            seenTxs.add(txId);

            if (tx.token_address) {
                const isSender = tx.from_address === address;
                const isReceiver = tx.to_address === address;

                if (isSender || isReceiver) {
                    if (!purchases.has(tx.token_address)) {
                        purchases.set(tx.token_address, []);
                    }

                    purchases.get(tx.token_address).push({
                        tx_hash: tx.hash,
                        amount: isReceiver ? tx.amount : -tx.amount,
                        token_symbol: tx.token_symbol || 'Unknown',
                        timestamp: tx.timestamp,
                        time: new Date(tx.timestamp * 1000).toLocaleString('zh-CN'),
                        other_address: isReceiver ? tx.from_address : tx.to_address,
                        type: isReceiver ? 'receive' : 'send'
                    });
                }
            }
        }

        return purchases;
    }

    /**
     * 格式化时间差
     */
    formatTimeDiff(seconds) {
        if (seconds < 60) return `${seconds}秒`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时`;
        return `${Math.floor(seconds / 86400)}天`;
    }

    /**
     * 生成建议标签
     */
    generateTags(avgScore, pairAnalysis) {
        const tags = [];

        if (avgScore >= 8) {
            tags.push('高度同控');
        } else if (avgScore >= 5) {
            tags.push('疑似关联');
        } else if (avgScore >= 3) {
            tags.push('弱关联');
        } else {
            tags.push('非关联');
        }

        // 检查是否有直接转账
        const hasDirectTransfer = pairAnalysis.some(p => p.direct_transfer?.exists);
        if (hasDirectTransfer) {
            tags.push('直接转账');
        }

        // 检查是否有时间相关的代币购买
        const hasTimedTokens = pairAnalysis.some(p =>
            p.common_tokens?.tokens_with_time_correlation > 0
        );
        if (hasTimedTokens) {
            tags.push('30秒内同步买币');
        }

        return tags;
    }
}

// 导出供使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyzerAPI;
}
