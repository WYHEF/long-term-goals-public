# 🚀 快速部署指南

## 🎯 推荐方案：Vercel 部署（5分钟完成）

### 为什么选择 Vercel？
- ✅ **完全免费**
- ✅ **自动 HTTPS**
- ✅ **全球 CDN 加速**
- ✅ **支持自定义域名**
- ✅ **Git push 自动部署**

---

## 📝 部署步骤（详细版）

### 第1步：准备 Git 仓库

#### 1.1 初始化 Git
在 PowerShell 中运行：

```powershell
cd D:\长期目标网站
git init
git add .
git commit -m "Initial commit: 长期目标管理系统"
```

#### 1.2 创建 GitHub 仓库

1. 访问 https://github.com/
2. 点击右上角 "+" → "New repository"
3. 仓库名：`long-term-goals-tracker`
4. 描述：长期目标管理和追踪系统
5. **重要**：选择 **Private**（私有仓库，保护代码）
6. 不要勾选任何初始化选项
7. 点击"Create repository"

#### 1.3 推送代码到 GitHub

复制 GitHub 提供的命令，在 PowerShell 中运行：

```powershell
git remote add origin https://github.com/你的用户名/long-term-goals-tracker.git
git branch -M main
git push -u origin main
```

**如果要求登录：**
- 输入 GitHub 用户名
- 密码使用 **Personal Access Token**（不是账户密码）
- 获取 Token：GitHub → Settings → Developer settings → Personal access tokens → Generate new token

---

### 第2步：部署到 Vercel

#### 2.1 注册/登录 Vercel

1. 访问：https://vercel.com/
2. 点击"Sign Up"或"Log In"
3. **用 GitHub 账号登录**（推荐）
4. 授权 Vercel 访问你的 GitHub

#### 2.2 导入项目

1. 进入 Vercel Dashboard
2. 点击"Add New" → "Project"
3. 找到 `long-term-goals-tracker` 仓库
4. 点击"Import"

#### 2.3 配置项目

**Framework Preset**: Vite（自动检测）
**Root Directory**: `./`（保持默认）
**Build Command**: `npm run build`（保持默认）
**Output Directory**: `dist`（保持默认）

#### 2.4 添加环境变量（重要！）

点击 "Environment Variables"，添加以下变量：

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（你的完整key） |
| `VITE_DEEPSEEK_API_URL` | `https://api.deepseek.com/v1/chat/completions` |
| `VITE_DEEPSEEK_API_KEY` | `sk-xxx...`（你的 DeepSeek API Key） |

**注意**：
- 每个变量都要点击"Add"按钮
- 确保没有多余的空格
- Key 要完整复制

#### 2.5 开始部署

1. 点击"Deploy"按钮
2. 等待 1-2 分钟（会看到构建日志）
3. ✅ 看到"Congratulations"就成功了！

#### 2.6 获取网站地址

部署成功后会得到：
- `https://long-term-goals-tracker-xxx.vercel.app`
- 点击"Visit"测试网站

---

### 第3步：绑定自定义域名

#### 3.1 在 Vercel 添加域名

1. 进入项目 → "Settings" → "Domains"
2. 输入你的域名，例如：`goals.你的域名.com`
3. 点击"Add"
4. Vercel 会显示需要配置的 DNS 记录

#### 3.2 配置 DNS（以阿里云为例）

1. 登录阿里云控制台
2. 进入"域名" → "域名列表"
3. 点击你的域名 → "解析设置"
4. 添加记录：

**CNAME 记录（推荐）：**
```
记录类型: CNAME
主机记录: goals（或 www）
记录值: cname.vercel-dns.com
TTL: 10分钟
```

**或 A 记录：**
```
记录类型: A
主机记录: goals（或 @）
记录值: 76.76.21.21
TTL: 10分钟
```

#### 3.3 等待生效

- DNS 生效时间：5-30 分钟
- 可以用 https://dnschecker.org/ 检查状态
- ✅ 访问 `https://goals.你的域名.com`

---

## 🔒 配置 Supabase（重要）

### 允许你的域名访问 Supabase

1. 访问：https://supabase.com/
2. 进入你的项目
3. Settings → Authentication → URL Configuration
4. 在"Site URL"中添加你的 Vercel 域名：
   ```
   https://long-term-goals-tracker-xxx.vercel.app
   ```
5. 在"Redirect URLs"中添加：
   ```
   https://long-term-goals-tracker-xxx.vercel.app/**
   https://goals.你的域名.com/**
   ```
6. 保存

**如果不配置这个，用户将无法登录！**

---

## 🔄 自动部署

配置完成后，每次你修改代码并推送到 GitHub：

```powershell
git add .
git commit -m "更新功能"
git push
```

Vercel 会自动：
1. 检测到代码更新
2. 自动构建
3. 自动部署
4. 几分钟后网站就更新了

---

## ✅ 检查清单

部署完成后，测试以下功能：

- [ ] 网站能正常访问
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 创建目标功能正常
- [ ] AI 分析功能正常
- [ ] 打卡功能正常
- [ ] 数据统计正常显示
- [ ] 想法收集箱正常
- [ ] 移动端显示正常

---

## 🐛 常见问题解决

### 问题1：部署后白屏

**原因**：环境变量未配置或配置错误

**解决**：
1. Vercel 项目 → Settings → Environment Variables
2. 检查所有变量是否正确
3. 重新部署：Deployments → 最新部署 → 三个点 → "Redeploy"

### 问题2：登录失败

**原因**：Supabase 域名未配置

**解决**：
1. 按照上面"配置 Supabase"步骤
2. 添加部署域名到 Supabase

### 问题3：AI 功能不工作

**原因**：DeepSeek API Key 未配置或无效

**解决**：
1. 检查 Vercel 环境变量中的 `VITE_DEEPSEEK_API_KEY`
2. 确保 API Key 有效
3. 检查 DeepSeek 账户余额

### 问题4：页面刷新 404

**原因**：路由配置问题

**解决**：
- ✅ 已在 `vercel.json` 中配置，应该不会出现
- 如果还有问题，检查 `vercel.json` 文件是否存在

### 问题5：域名不生效

**原因**：DNS 未生效或配置错误

**解决**：
1. 等待 10-30 分钟
2. 用 https://dnschecker.org/ 检查 DNS
3. 确认 DNS 记录配置正确

---

## 📊 监控和维护

### 查看访问日志
- Vercel 项目 → Analytics
- 可以看到访问量、性能等数据

### 查看错误日志
- Vercel 项目 → Deployments → 点击部署 → "View Function Logs"

### 性能优化
- 图片优化
- 代码分割
- 懒加载

---

## 💰 费用说明

### Vercel
- ✅ **免费计划**：
  - 100GB 带宽/月
  - 无限部署
  - 自动 HTTPS
  - 对个人项目完全够用

### DeepSeek API
- 按使用量付费
- 约 1元 = 1000次 AI 分析
- 非常便宜

### Supabase
- ✅ **免费计划**：
  - 500MB 数据库
  - 50,000 月活用户
  - 对小型项目完全够用

**总计：基本免费！**

---

## 🎉 完成！

恭喜！你的长期目标管理系统已经上线了！

**分享给朋友：**
- 发送你的域名链接
- 他们注册账号即可使用
- 数据完全隔离，安全可靠

**继续开发：**
- 修改代码 → Git push → 自动部署
- 无需手动操作

---

需要帮助？随时问我！🚀

