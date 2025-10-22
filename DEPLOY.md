# 部署指南 - 如何将网页分享给他人

## 方法1：GitHub Pages（推荐 - 免费且永久）

### 步骤1：初始化Git仓库
```bash
cd "C:\Users\k\Desktop\区块链\twitter-monitor"
git init
git add .
git commit -m "Initial commit: Twitter Monitor with DevHunter and Address Analyzer"
```

### 步骤2：创建GitHub仓库
1. 访问 https://github.com/new
2. 仓库名称填写：`twitter-monitor`
3. 设置为 Public（公开）
4. 不要勾选任何初始化选项
5. 点击"Create repository"

### 步骤3：推送到GitHub
```bash
git remote add origin https://github.com/你的用户名/twitter-monitor.git
git branch -M main
git push -u origin main
```

### 步骤4：启用GitHub Pages
1. 进入仓库页面
2. 点击"Settings"（设置）
3. 左侧菜单选择"Pages"
4. Source选择"main"分支，文件夹选择"/ (root)"
5. 点击"Save"
6. 等待几分钟后，访问：`https://你的用户名.github.io/twitter-monitor/`

**优点**：
- ✅ 完全免费
- ✅ 永久有效
- ✅ 支持自定义域名
- ✅ 自动HTTPS
- ✅ 全球CDN加速

---

## 方法2：Vercel（推荐 - 一键部署）

### 步骤：
1. 访问 https://vercel.com
2. 使用GitHub账号登录
3. 点击"Import Project"
4. 选择你的GitHub仓库
5. 保持默认配置，点击"Deploy"
6. 等待部署完成，获得链接：`https://your-project.vercel.app`

**优点**：
- ✅ 部署速度快（30秒内）
- ✅ 自动CI/CD（推送代码自动更新）
- ✅ 免费SSL证书
- ✅ 全球CDN

---

## 方法3：Netlify（类似Vercel）

### 步骤：
1. 访问 https://netlify.com
2. 使用GitHub账号登录
3. 点击"Add new site" → "Import an existing project"
4. 选择GitHub，授权并选择仓库
5. Build settings留空（静态HTML项目）
6. 点击"Deploy site"
7. 获得链接：`https://random-name.netlify.app`（可修改）

---

## 方法4：本地网络分享（临时）

### 使用Python（最简单）
```bash
cd "C:\Users\k\Desktop\区块链\twitter-monitor"
python -m http.server 8000
```
然后告诉他人访问：`http://你的IP地址:8000`

### 使用Node.js
```bash
npx serve -p 8000
```

### 获取你的IP地址
```bash
# Windows
ipconfig

# 找到 IPv4 地址，通常类似：192.168.1.xxx
```

**优点**：
- ✅ 无需注册账号
- ✅ 立即可用

**缺点**：
- ❌ 仅限局域网访问
- ❌ 关闭电脑后失效
- ❌ 需要防火墙允许

---

## 方法5：内网穿透（临时公网访问）

### 使用ngrok
```bash
# 1. 下载 ngrok: https://ngrok.com/download
# 2. 解压并运行
ngrok http 8000
```

会生成一个临时公网地址，例如：`https://abc123.ngrok.io`

**优点**：
- ✅ 可通过公网访问
- ✅ 无需服务器

**缺点**：
- ❌ 免费版链接会变化
- ❌ 需要保持运行

---

## 方法6：云服务器部署（长期稳定）

### 使用Nginx
1. 购买云服务器（阿里云/腾讯云）
2. 安装Nginx
3. 上传文件到服务器
4. 配置Nginx指向项目目录
5. 绑定域名（可选）

---

## 🎯 推荐方案对比

| 方案 | 免费 | 速度 | 稳定性 | 难度 | 适用场景 |
|------|------|------|--------|------|----------|
| **GitHub Pages** | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | 长期公开分享 |
| **Vercel** | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | 最快部署 |
| **Netlify** | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | 替代Vercel |
| **本地服务器** | ✅ | ⭐⭐⭐ | ⭐ | ⭐⭐ | 局域网测试 |
| **ngrok** | ⚠️部分 | ⭐⭐ | ⭐⭐ | ⭐ | 临时演示 |
| **云服务器** | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 企业级应用 |

---

## 📝 快速开始命令（推荐GitHub Pages）

```bash
# 1. 初始化Git
cd "C:\Users\k\Desktop\区块链\twitter-monitor"
git init
git add .
git commit -m "feat: Add Twitter Monitor with DevHunter and Address Analyzer"

# 2. 创建GitHub仓库（在网页上操作）
# 访问: https://github.com/new

# 3. 推送代码（替换your-username为你的GitHub用户名）
git remote add origin https://github.com/your-username/twitter-monitor.git
git branch -M main
git push -u origin main

# 4. 启用GitHub Pages（在仓库Settings -> Pages中操作）
# 完成后访问: https://your-username.github.io/twitter-monitor/
```

---

## ⚠️ 注意事项

1. **API密钥安全**：
   - Helius API Key已硬编码在代码中
   - 如果是私密项目，建议使用环境变量
   - 公开部署时注意API配额限制

2. **CORS问题**：
   - Helius API支持跨域，无需额外配置
   - 如遇到CORS错误，可能需要后端代理

3. **性能优化**：
   - GitHub Pages自动启用CDN
   - 考虑压缩图片和代码

4. **域名绑定**（可选）：
   - GitHub Pages支持自定义域名
   - 在仓库设置中添加CNAME记录

---

## 🆘 常见问题

### Q: GitHub Pages显示404？
A: 等待5-10分钟，GitHub需要时间构建。检查Settings->Pages中的状态。

### Q: 样式丢失？
A: 检查CSS/JS路径是否正确。GitHub Pages部署后，确保路径是相对路径。

### Q: API调用失败？
A: 检查浏览器控制台，可能是CORS或API配额问题。

### Q: 如何更新已部署的网站？
A: 修改代码后，执行：
```bash
git add .
git commit -m "Update: description"
git push
```
GitHub Pages会自动更新（几分钟内生效）。

---

需要帮助？创建Issue: https://github.com/your-username/twitter-monitor/issues
