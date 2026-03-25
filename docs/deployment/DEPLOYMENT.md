# 部署指南

## 🚀 快速开始

### 1. 前置要求

- Node.js 16+ 
- npm 或 yarn
- Supabase 账号
- DeepSeek API Key（可选）

### 2. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 3. 配置 Supabase

#### 3.1 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目
3. 等待项目初始化完成

#### 3.2 执行数据库迁移

1. 在 Supabase Dashboard 中，进入 SQL Editor
2. 打开 `database/schema.sql` 文件
3. 复制所有 SQL 代码
4. 在 SQL Editor 中粘贴并执行

#### 3.3 获取项目配置

在 Supabase Dashboard 的 Settings > API 中获取：
- Project URL
- anon/public key

### 4. 配置环境变量

复制 `.env.example` 为 `.env`:

\`\`\`bash
cp .env.example .env
\`\`\`

填入你的配置：

\`\`\`env
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# DeepSeek API 配置（可选）
VITE_DEEPSEEK_API_KEY=your-deepseek-api-key
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
\`\`\`

### 5. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:3000

## 📦 生产部署

### 方案一：Vercel（推荐）

#### 1. 准备代码

确保代码已提交到 Git 仓库（GitHub/GitLab/Bitbucket）

#### 2. 导入到 Vercel

1. 访问 [Vercel](https://vercel.com/)
2. 点击 "New Project"
3. 导入你的 Git 仓库
4. 配置环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_DEEPSEEK_API_KEY`（可选）

#### 3. 部署

点击 "Deploy" 按钮，等待部署完成。

#### 4. 配置自定义域名（可选）

在 Vercel 项目设置中添加自定义域名。

### 方案二：Netlify

#### 1. 构建项目

\`\`\`bash
npm run build
\`\`\`

#### 2. 部署到 Netlify

1. 访问 [Netlify](https://www.netlify.com/)
2. 拖拽 `dist` 文件夹到 Netlify
3. 或者连接 Git 仓库自动部署

#### 3. 配置环境变量

在 Netlify 项目设置中添加环境变量。

### 方案三：自己的服务器

#### 1. 构建生产版本

\`\`\`bash
npm run build
\`\`\`

#### 2. 配置 Nginx

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
\`\`\`

#### 3. 重启 Nginx

\`\`\`bash
sudo systemctl restart nginx
\`\`\`

## 🔐 安全配置

### 1. Supabase RLS（行级安全）

数据库已启用 RLS，确保用户只能访问自己的数据。

### 2. API Key 保护

- 不要将 API Key 提交到版本控制
- 使用环境变量存储敏感信息
- 定期轮换 API Key

### 3. HTTPS

生产环境务必启用 HTTPS。Vercel 和 Netlify 会自动配置。

## 📱 移动端访问

网站已支持响应式设计，可以直接在手机浏览器中访问。

### 添加到主屏幕（PWA）

虽然当前版本不是完整的 PWA，但可以在浏览器中"添加到主屏幕"获得类似 App 的体验。

## 🔧 常见问题

### 1. Supabase 连接失败

- 检查 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确
- 确认 Supabase 项目处于活动状态
- 检查网络连接

### 2. AI 功能不工作

- 确认 DeepSeek API Key 已正确配置
- 检查 API 额度是否充足
- 查看浏览器控制台错误信息

### 3. 数据无法同步

- 确认已登录
- 检查 Supabase RLS 策略是否正确执行
- 查看浏览器控制台网络请求

### 4. 构建失败

#### 4.1 通用构建问题

\`\`\`bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install

# 重新构建
npm run build
\`\`\`

#### 4.2 "Could not resolve entry module" 错误

**现象**：构建时报错 `Could not resolve entry module "marked"` 或其他模块名。

**原因**：`vite.config.js` 中的 `manualChunks` 配置了未安装的依赖包。

**解决**：
1. 检查 `vite.config.js` 中的 `build.rollupOptions.output.manualChunks` 配置。
2. 移除未安装或未使用的模块名称。
3. 或者，如果是需要的模块，请确保已安装：`npm install <module_name>`。

例如，移除未使用的 `marked`：

\`\`\`javascript
// 修改前
manualChunks: {
  'vendor-ui': ['@heroicons/vue', 'marked']
}

// 修改后
manualChunks: {
  'vendor-ui': ['@heroicons/vue']
}
\`\`\`

## 📊 性能优化

### 1. 代码分割

项目已使用路由级代码分割，自动按需加载。

### 2. 图片优化

建议使用 WebP 格式的图片，并启用懒加载。

### 3. CDN 加速

Vercel 和 Netlify 自带全球 CDN。

### 4. 缓存策略

静态资源会自动设置缓存头。

## 🔄 更新和维护

### 1. 更新依赖

\`\`\`bash
npm update
\`\`\`

### 2. 数据库迁移

如果数据库结构有更新，需要在 Supabase SQL Editor 中执行新的迁移脚本。

### 3. 备份数据

定期在设置页面导出数据备份。

## 📞 技术支持

如遇问题，请：

1. 查看浏览器控制台错误
2. 检查 Supabase Dashboard 日志
3. 参考本文档的常见问题部分

---

**祝你部署顺利！** 🎉

