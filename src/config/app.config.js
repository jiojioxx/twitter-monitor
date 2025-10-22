/**
 * Application Configuration
 */
const AppConfig = {
    // Application Info
    app: {
        name: 'Twitter Monitor',
        version: '1.0.0',
        description: 'Real-time Twitter Monitoring Platform',
        author: 'Your Company',
    },

    // Feature Flags
    features: {
        enableWalletConnection: true,
        enableNotifications: true,
        enableAnalytics: true,
        enableWebSocket: true,
        enableDarkMode: true,
    },

    // UI Configuration
    ui: {
        defaultTheme: 'dark',
        animationDuration: 300,
        toastDuration: 3000,
        maxToasts: 3,
        debounceDelay: 300,
    },

    // Pagination
    pagination: {
        defaultPageSize: 20,
        pageSizeOptions: [10, 20, 50, 100],
    },

    // Cache Configuration
    cache: {
        enabled: true,
        ttl: 300000, // 5 minutes in milliseconds
        maxSize: 100, // Maximum number of cached items
    },

    // Monitoring Settings
    monitoring: {
        refreshInterval: 5000, // 5 seconds
        maxFollowAccounts: 100,
        maxKeywords: 50,
        streamBatchSize: 10,
    },

    // Wallet Configuration
    wallet: {
        supportedWallets: ['phantom', 'metamask', 'okx'],
        chainId: 1, // Ethereum mainnet
        requiredChainId: 1,
    },

    // Notification Settings
    notifications: {
        position: 'top-right',
        defaultDuration: 5000,
        maxNotifications: 5,
        soundEnabled: false,
    },

    // Storage Keys
    storage: {
        prefix: 'tw_monitor_',
        keys: {
            theme: 'theme',
            user: 'user',
            settings: 'settings',
            followList: 'follow_list',
            keywords: 'keywords',
            walletAddress: 'wallet_address',
        },
    },

    // Validation Rules
    validation: {
        username: {
            minLength: 3,
            maxLength: 20,
            pattern: /^[a-zA-Z0-9_]+$/,
        },
        keyword: {
            minLength: 2,
            maxLength: 50,
        },
        address: {
            pattern: /^0x[a-fA-F0-9]{40}$/,
        },
    },

    // Error Messages
    errors: {
        network: '网络连接失败，请检查您的连接',
        unauthorized: '未授权访问，请先登录',
        forbidden: '无权访问此资源',
        notFound: '请求的资源不存在',
        serverError: '服务器错误，请稍后重试',
        validation: '输入验证失败',
        walletConnection: '钱包连接失败',
        timeout: '请求超时',
    },

    // Success Messages
    messages: {
        walletConnected: '钱包连接成功',
        walletDisconnected: '钱包已断开连接',
        settingsSaved: '设置已保存',
        followAdded: '关注成功',
        followRemoved: '取消关注成功',
        keywordAdded: '关键词添加成功',
        keywordRemoved: '关键词删除成功',
    },
};

// Freeze the configuration to prevent modifications
Object.freeze(AppConfig);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}