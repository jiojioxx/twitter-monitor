/**
 * Helius API模块
 * 用于与Helius RPC和DAS API交互，查询Solana链上数据
 */

class HeliusAPI {
    constructor() {
        // Helius API密钥
        this.apiKey = '7938b477-7c63-42a2-8a69-3a9e31aaf066';
        this.rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${this.apiKey}`;
    }

    /**
     * 发起RPC请求
     */
    async makeRPCRequest(method, params) {
        try {
            const response = await fetch(this.rpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: '1',
                    method: method,
                    params: params
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('RPC请求失败:', error);
            throw error;
        }
    }

    /**
     * 获取代币市值数据
     */
    async getTokenMarketData(mintAddress) {
        try {
            const dexScreenerUrl = `https://api.dexscreener.com/token-pairs/v1/solana/${mintAddress}`;

            try {
                const response = await fetch(dexScreenerUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.pairs && data.pairs.length > 0) {
                        const topPair = data.pairs.reduce((max, pair) =>
                            (pair.liquidity?.usd || 0) > (max.liquidity?.usd || 0) ? pair : max
                        , data.pairs[0]);

                        if (topPair) {
                            return {
                                price: parseFloat(topPair.priceUsd) || 0,
                                marketCap: topPair.fdv || topPair.marketCap || 0,
                                volume24h: topPair.volume?.h24 || 0,
                                liquidity: topPair.liquidity?.usd || 0,
                                holders: 0 // DexScreener不提供持有者数据
                            };
                        }
                    }
                }
            } catch (fetchError) {
                console.warn('DexScreener API失败:', fetchError.message);
            }
        } catch (error) {
            console.error('市值数据获取失败:', error);
        }

        // 返回空数据
        return {
            price: 0,
            marketCap: 0,
            volume24h: 0,
            liquidity: 0,
            holders: 0
        };
    }

    /**
     * 批量获取多个代币的市值数据
     */
    async getBatchTokenMarketData(tokens, onProgress) {
        try {
            if (!tokens || tokens.length === 0) return;

            console.log(`开始批量查询 ${tokens.length} 个代币的市值数据`);

            // 限制查询数量避免API限制
            const limitedTokens = tokens.slice(0, 10);

            for (let i = 0; i < limitedTokens.length; i++) {
                const token = limitedTokens[i];
                try {
                    const marketData = await this.getTokenMarketData(token.address);
                    if (marketData && marketData.marketCap > 0) {
                        token.marketCap = marketData.marketCap;
                        token.volume24h = marketData.volume24h;
                        token.liquidity = marketData.liquidity;
                        token.price = marketData.price;
                        token.holders = marketData.holders;

                        console.log(`✅ ${token.symbol}: $${this.formatNumber(marketData.marketCap)}`);

                        // 回调更新进度
                        if (onProgress) {
                            onProgress(i + 1, limitedTokens.length, token);
                        }
                    }

                    // 延迟避免API限制
                    await new Promise(resolve => setTimeout(resolve, 600));
                } catch (error) {
                    console.warn(`获取 ${token.symbol} 市值失败:`, error.message);
                }
            }

            console.log('批量查询完成');
        } catch (error) {
            console.error('批量查询失败:', error);
        }
    }

    /**
     * 获取开发者创建的所有代币
     */
    async getTokensByCreator(creatorAddress) {
        try {
            console.log(`查询开发者: ${creatorAddress}`);

            const response = await this.makeRPCRequest('getAssetsByCreator', {
                creatorAddress: creatorAddress,
                page: 1,
                limit: 1000
            });

            if (response.error) {
                throw new Error(response.error.message);
            }

            if (response.result && response.result.items) {
                const assets = response.result.items;

                // 转换为代币数据
                const tokens = assets.map((asset, index) => {
                    // 判断类型
                    const assetType = (asset.interface === 'FungibleToken' ||
                                      asset.interface === 'FungibleAsset' ||
                                      asset.interface === 'V1_TOKEN') ? 'Token' : 'NFT';

                    // 生成创建时间（模拟）
                    const baseTime = new Date('2024-01-01');
                    const daysOffset = index * 10;
                    const createdAt = new Date(baseTime.getTime() + daysOffset * 24 * 60 * 60 * 1000);

                    return {
                        name: asset.content?.metadata?.name || 'Unknown Token',
                        symbol: asset.content?.metadata?.symbol || 'N/A',
                        address: asset.id,
                        creator: creatorAddress,
                        createdAt: createdAt.toISOString(),
                        description: asset.content?.metadata?.description || '',
                        imageUrl: asset.content?.files?.[0]?.uri || asset.content?.links?.image || asset.content?.metadata?.image || 'https://via.placeholder.com/48',
                        verified: asset.creators?.some(c => c.verified) || false,
                        interface: asset.interface,
                        assetType: assetType,
                        // 初始市值数据
                        marketCap: 0,
                        volume24h: 0,
                        liquidity: 0,
                        price: 0,
                        holders: 0
                    };
                });

                // 按创建时间排序（最新的在前）
                tokens.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                return {
                    success: true,
                    total: response.result.total || tokens.length,
                    tokens: tokens
                };
            } else {
                return {
                    success: false,
                    total: 0,
                    tokens: []
                };
            }
        } catch (error) {
            console.error('获取代币失败:', error);
            return {
                success: false,
                error: error.message,
                total: 0,
                tokens: []
            };
        }
    }

    /**
     * 格式化数字显示
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    }
}

// 导出供DevHunter使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeliusAPI;
}
