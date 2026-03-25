# 🚀 网站部署指南

## 方案对比

| 方案 | 难度 | 费用 | 速度 | 推荐度 |
|------|------|------|------|--------|
| Vercel | ⭐ 简单 | 免费 | 快 | ⭐⭐⭐⭐⭐ |
| Netlify | ⭐ 简单 | 免费 | 快 | ⭐⭐⭐⭐ |
| 云服务器 | ⭐⭐⭐ 复杂 | 付费 | 中等 | ⭐⭐⭐ |
| GitHub Pages | ⭐⭐ 中等 | 免费 | 慢 | ⭐⭐ |

---

## 🌟 方案A：Vercel 部署（推荐）

### 为什么选择 Vercel？
- ✅ 完全免费
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署
- ✅ 5分钟完成

### 部署步骤

#### 第1步：准备 Git 仓库

1. **安装 Git**（如果还没有）
   - 访问：https://git-scm.com/
   - 下载并安装

2. **初始化 Git 仓库**
```bash
cd D:\长期目标网站
git init
git add .
git commit -m "Initial commit"
```

3. **推送到 GitHub**
   - 访问 https://github.com/
   - 创建新仓库（New Repository）
   - 仓库名：`long-term-goals`
   - 设置为 **Private**（重要！保护你的代码）
   - 复制仓库地址

```bash
git remote add origin https://github.com/你的用户名/long-term-goals.git
git branch -M main
git push -u origin main
```

#### 第2步：部署到 Vercel

1. **访问 Vercel**
   - 打开：https://vercel.com/
   - 用 GitHub 账号登录

2. **导入项目**
   - 点击"Add New" → "Project"
   - 选择你的 GitHub 仓库
   - 点击"Import"

3. **配置环境变量**
   在 "Environment Variables" 中添加：
   
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   ```
   
   ```
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
   
   ```
   VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
   ```
   
   ```
   VITE_DEEPSEEK_API_KEY=你的API_Key
   ```

4. **点击 Deploy**
   - 等待 1-2 分钟
   - ✅ 部署完成！

5. **获取网站地址**
   - 会得到类似：`https://long-term-goals-xxx.vercel.app`

#### 第3步：绑定自定义域名

1. **在 Vercel 项目设置中**
   - 进入项目 → Settings → Domains
   - 添加你的域名：`www.你的域名.com`

2. **配置 DNS 记录**
   在你的域名管理处（阿里云/腾讯云等）添加：
   
   **方式1：CNAME（推荐）**
   ```
   类型: CNAME
   主机记录: www
   记录值: cname.vercel-dns.com
   ```
   
   **方式2：A 记录**
   ```
   类型: A
   主机记录: @
   记录值: 76.76.21.21
   ```

3. **等待生效**
   - DNS 生效：5-30分钟
   - ✅ 访问你的域名即可！

---

## 🌐 方案B：Netlify 部署

### 部署步骤

1. **访问 Netlify**：https://www.netlify.com/
2. **用 GitHub 登录**
3. **Import from Git** → 选择仓库
4. **配置环境变量**（同 Vercel）
5. **点击 Deploy**
6. **绑定域名**：Site settings → Domain management

---

## 🖥️ 方案C：云服务器部署

### 适合场景
- 有自己的服务器
- 需要完全控制
- 愿意折腾

### 部署步骤

#### 1. 构建项目
```bash
npm run build
```

#### 2. 上传到服务器
```bash
# 将 dist 文件夹上传到服务器
scp -r dist/* user@你的服务器IP:/var/www/html/
```

#### 3. 配置 Nginx

创建 `/etc/nginx/sites-available/goals` 文件：

```nginx
server {
    listen 80;
    server_name 你的域名.com;
    root /var/www/html;
    index index.html;

    # 处理 Vue Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 4. 启用站点
```bash
sudo ln -s /etc/nginx/sites-available/goals /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. 配置 HTTPS（Let's Encrypt）
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d 你的域名.com
```

---

## 🔒 安全注意事项

### 1. 保护环境变量
- ✅ `.env` 文件已在 `.gitignore` 中
- ⚠️ 不要把 API Key 提交到 GitHub
- ✅ 使用部署平台的环境变量功能

### 2. Supabase 安全配置
在 Supabase 项目设置中：
- Authentication → URL Configuration
- 添加你的部署域名到 "Site URL"
- 添加到 "Redirect URLs"

### 3. API Key 保护
- DeepSeek API Key 只用于服务器端
- 不要在前端暴露敏感 Key

---

## 📱 后续优化

### 1. 自动部署
- 推送代码到 GitHub
- Vercel/Netlify 自动部署
- 无需手动操作

### 2. 性能优化
```bash
# 分析打包大小
npm run build -- --report
```

### 3. SEO 优化
- 添加 meta 标签
- 配置 sitemap
- 添加 robots.txt

### 4. 监控和分析
- 集成 Google Analytics
- 添加错误监控（Sentry）

---

## 🆘 常见问题

### Q: 部署后白屏？
A: 检查浏览器控制台，通常是环境变量未配置

### Q: 路由刷新 404？
A: 需要配置服务器支持 SPA（已在上述配置中处理）

### Q: 域名不生效？
A: DNS 生效需要时间，耐心等待 5-30 分钟

### Q: HTTPS 证书错误？
A: Vercel/Netlify 自动配置，如果是自己服务器需要配置 Let's Encrypt

---

## 📞 需要帮助？

如果遇到问题：
1. 查看部署平台的日志
2. 检查环境变量配置
3. 确认域名 DNS 配置
4. 随时问我！

---

**选择方案并开始部署吧！** 🚀

