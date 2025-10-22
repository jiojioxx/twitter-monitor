# Twitter Monitor - 推特实时监控平台

## 项目简介

这是一个模块化的推特实时监控平台前端框架，采用现代化的架构设计，便于与后端系统集成。

## 🚀 核心功能

- **实时监控**: WebSocket实时推文流
- **用户管理**: 关注列表管理和状态监控
- **数据分析**: 可视化数据展示和趋势分析
- **钱包集成**: 支持多种加密钱包连接
- **通知系统**: 智能推送和提醒
- **响应式设计**: 完美适配桌面和移动设备

## 📁 项目结构

```
twitter-monitor/
├── index.html                 # 主页面
├── src/
│   ├── config/                # 配置文件
│   │   ├── app.config.js     # 应用配置
│   │   └── api.config.js     # API配置
│   ├── services/              # 服务层
│   │   ├── api.service.js    # API服务
│   │   ├── auth.service.js   # 认证服务
│   │   ├── websocket.service.js # WebSocket服务
│   │   └── storage.service.js # 存储服务
│   ├── modules/               # 功能模块
│   │   ├── core/             # 核心模块
│   │   ├── components/       # UI组件
│   │   ├── header/           # 头部模块
│   │   ├── dashboard/        # 仪表板模块
│   │   ├── monitor/          # 监控模块
│   │   ├── analytics/        # 分析模块
│   │   ├── settings/         # 设置模块
│   │   ├── wallet/           # 钱包模块
│   │   └── notifications/    # 通知模块
│   ├── styles/               # 样式文件
│   │   ├── reset.css        # CSS重置
│   │   ├── variables.css    # CSS变量
│   │   ├── base.css         # 基础样式
│   │   ├── components.css   # 组件样式
│   │   ├── modules.css      # 模块样式
│   │   └── responsive.css   # 响应式样式
│   ├── utils/                # 工具函数
│   └── app.js               # 应用入口
├── public/                   # 静态资源
└── assets/                   # 资源文件
```

## 🛠 架构特点

### 1. 模块化设计
- 每个功能独立成模块
- 模块间通过事件总线通信
- 易于维护和扩展

### 2. 服务层分离
- API服务统一管理HTTP请求
- 认证服务处理用户会话
- WebSocket服务管理实时连接
- 存储服务处理本地数据

### 3. 配置驱动
- 集中配置管理
- 环境变量支持
- 功能开关控制

### 4. 事件驱动
- 全局事件总线
- 模块间解耦通信
- 状态管理

## 🎨 UI组件

### 按钮组件
```html
<button class="btn btn-primary">主要按钮</button>
<button class="btn btn-secondary">次要按钮</button>
<button class="btn btn-success">成功按钮</button>
```

### 卡片组件
```html
<div class="card">
    <div class="card-header">
        <h3 class="card-title">标题</h3>
    </div>
    <div class="card-body">
        内容
    </div>
</div>
```

### 徽章组件
```html
<span class="badge badge-primary">主要</span>
<span class="badge badge-success">成功</span>
<span class="badge badge-warning">警告</span>
```

## 📱 响应式设计

- **桌面**: 1024px+
- **平板**: 768px - 1024px
- **手机**: < 768px

## 🔧 API集成指南

### 1. 配置API端点
```javascript
// src/config/api.config.js
const ApiConfig = {
    baseURL: 'https://your-api.com/api',
    endpoints: {
        twitter: {
            follow: {
                list: '/twitter/follow/list',
                add: '/twitter/follow/add',
                remove: '/twitter/follow/remove'
            }
        }
    }
};
```

### 2. 使用API服务
```javascript
// 获取关注列表
const followList = await apiService.get(ApiConfig.endpoints.twitter.follow.list);

// 添加关注
const result = await apiService.post(ApiConfig.endpoints.twitter.follow.add, {
    username: 'example'
});
```

### 3. WebSocket集成
```javascript
// 订阅用户更新
webSocketService.subscribeToUser('username');

// 监听新推文
webSocketService.on('tweet:new', (tweet) => {
    console.log('新推文:', tweet);
});
```

## 💾 数据存储

### 本地存储
```javascript
// 存储数据
StorageService.set('key', value);

// 获取数据
const data = StorageService.get('key', defaultValue);

// 带过期时间存储
StorageService.set('key', value, 3600000); // 1小时后过期
```

### 会话存储
```javascript
StorageService.sessionSet('key', value);
const data = StorageService.sessionGet('key');
```

## 🔐 认证集成

### 基础认证
```javascript
// 登录
const result = await authService.login({
    email: 'user@example.com',
    password: 'password'
});

// 检查认证状态
if (authService.isAuthenticated) {
    console.log('当前用户:', authService.currentUser);
}
```

### 钱包认证
```javascript
// 钱包登录
const result = await authService.loginWithWallet(address, signature);
```

## 🎯 事件系统

### 监听事件
```javascript
// 全局事件监听
window.eventBus.on('auth:success', (user) => {
    console.log('用户登录成功:', user);
});

// 导航事件
window.eventBus.on('navigate', (module) => {
    console.log('导航到:', module);
});
```

### 触发事件
```javascript
// 触发事件
window.eventBus.emit('custom:event', data);
```

## 🚀 快速开始

1. **克隆项目**
```bash
git clone <repository-url>
cd twitter-monitor
```

2. **配置API端点**
```javascript
// 修改 src/config/api.config.js
const ApiConfig = {
    baseURL: 'YOUR_API_URL',
    // ... 其他配置
};
```

3. **启动开发服务器**
```bash
# 使用任意HTTP服务器
python -m http.server 8000
# 或
npx serve .
```

4. **打开浏览器**
```
http://localhost:8000
```

## 🔧 自定义开发

### 添加新模块
1. 在 `src/modules/` 创建模块文件夹
2. 实现模块类，继承基础模块
3. 在 `src/app.js` 中注册模块
4. 添加路由和导航

### 添加新API端点
1. 在 `src/config/api.config.js` 添加端点
2. 在相应模块中调用API服务
3. 处理响应数据

### 自定义样式
1. 修改 `src/styles/variables.css` 中的CSS变量
2. 在 `src/styles/modules.css` 添加模块样式
3. 保持响应式设计原则

## 📋 待办事项

- [ ] 添加单元测试
- [ ] 集成PWA功能
- [ ] 添加国际化支持
- [ ] 性能优化
- [ ] 错误边界处理
- [ ] 数据缓存策略

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

MIT License

## 📞 联系我们

如有问题或建议，请提交Issue或联系开发团队。