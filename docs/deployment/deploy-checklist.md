# ✅ 部署前检查清单

## 📋 开始部署前请确认

### 1. 代码准备
- [ ] 所有功能都已测试正常
- [ ] AI 功能在本地可以正常使用
- [ ] 用户登录注册正常
- [ ] 打卡功能正常
- [ ] `.gitignore` 包含 `.env`（避免泄露密钥）

### 2. 必需的信息
- [ ] GitHub 账号（用于托管代码）
- [ ] Vercel 账号（免费，用 GitHub 登录）
- [ ] Supabase 信息：
  - URL: `https://your-project.supabase.co`
  - Anon Key: `eyJhbGci...`（你的完整key）
- [ ] DeepSeek API Key: `sk-...`（你的key）
- [ ] 域名（如果要绑定自定义域名）

---

## 🚀 部署步骤（简化版）

### 第1步：推送代码到 GitHub（5分钟）

```powershell
# 1. 初始化 Git
cd D:\长期目标网站
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "Initial commit: 长期目标管理系统"

# 4. 创建 GitHub 仓库后，推送代码
git remote add origin https://github.com/你的用户名/long-term-goals-tracker.git
git branch -M main
git push -u origin main
```

**提示**：如果要求登录，使用 Personal Access Token，不是密码

---

### 第2步：部署到 Vercel（3分钟）

1. **访问** https://vercel.com/
2. **用 GitHub 登录**
3. **导入项目**：Add New → Project → 选择你的仓库
4. **配置环境变量**（点击 Environment Variables）：
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGci...（完整的key）
   VITE_DEEPSEEK_API_URL = https://api.deepseek.com/v1/chat/completions
   VITE_DEEPSEEK_API_KEY = sk-...（你的key）
   ```
5. **点击 Deploy**
6. **等待 1-2 分钟**
7. ✅ **完成！** 得到网址：`https://xxx.vercel.app`

---

### 第3步：配置 Supabase（2分钟）

1. 访问 https://supabase.com/
2. 进入你的项目
3. Settings → Authentication → URL Configuration
4. 添加 Vercel 给你的网址到：
   - Site URL
   - Redirect URLs（记得加 `/**`）
5. 保存

---

### 第4步：测试（5分钟）

访问你的网站，测试：
- [ ] 注册新用户
- [ ] 登录
- [ ] 创建目标
- [ ] 使用 AI 分析
- [ ] 打卡
- [ ] 查看统计

---

### 第5步：绑定域名（可选，10分钟）

1. **Vercel**：Settings → Domains → 添加你的域名
2. **DNS配置**（在阿里云/腾讯云等）：
   ```
   类型: CNAME
   主机: goals（或其他子域名）
   值: cname.vercel-dns.com
   ```
3. **等待 10-30 分钟**
4. ✅ 访问你的域名

---

## 📝 环境变量模板

复制这个，填入你的实际值：

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# DeepSeek
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
VITE_DEEPSEEK_API_KEY=你的_deepseek_key
```

---

## ⚠️ 重要提醒

1. **不要把 `.env` 文件提交到 GitHub**
   - ✅ 已在 `.gitignore` 中
   
2. **API Key 保密**
   - DeepSeek API Key 只配置在 Vercel 环境变量
   - 不要截图分享
   
3. **Supabase 域名配置**
   - 必须添加部署域名，否则无法登录
   
4. **定期备份**
   - Supabase 自动备份数据库
   - 也可以手动导出

---

## 🎯 完成后

你将拥有：
- ✅ 一个在线的长期目标管理系统
- ✅ 支持多用户使用
- ✅ 自动 HTTPS 加密
- ✅ 全球 CDN 加速
- ✅ 自动部署更新
- ✅ 完全免费（基础使用）

---

## 📞 遇到问题？

### 常见错误及解决

1. **部署失败**
   - 检查构建日志
   - 确认 `package.json` 正确
   
2. **白屏**
   - 检查环境变量
   - 查看浏览器控制台错误
   
3. **登录失败**
   - 配置 Supabase 域名
   - 清除浏览器缓存
   
4. **AI 不工作**
   - 检查 DeepSeek API Key
   - 确认账户有余额

---

**准备好了吗？开始部署吧！** 🚀

预计总时间：**15-20 分钟**

