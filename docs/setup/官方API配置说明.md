# 🎉 切换到官方 DeepSeek API 指南

## 第1步：注册并获取 API Key

### 1. 访问官方网站
打开浏览器访问：**https://platform.deepseek.com/**

### 2. 注册账号
- 点击"注册"或"Sign Up"
- 使用邮箱注册
- 验证邮箱

### 3. 获取 API Key
1. 登录后进入控制台
2. 找到"API Keys"或"密钥管理"
3. 点击"创建新密钥"
4. 复制生成的 API Key（格式类似：`sk-xxxxxxxxxxxxxxxx`）
5. ⚠️ 保存好，只显示一次！

### 4. 充值（可选）
- DeepSeek 提供免费额度
- 如需更多使用，可以充值
- 价格：约 1元 = 100万 tokens（非常便宜）

---

## 第2步：配置 .env 文件

打开 `D:\长期目标网站\.env` 文件，修改为：

```env
# Supabase 配置（保持不变）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# DeepSeek API 配置（修改这里）
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
VITE_DEEPSEEK_API_KEY=你从官网获取的API_Key
```

**重要**：
- 把 `你从官网获取的API_Key` 替换成你实际的 API Key
- API Key 格式通常是 `sk-` 开头的长字符串

---

## 第3步：重启开发服务器

在 PowerShell 中：

```powershell
# 1. 停止当前服务器（如果正在运行）
#    按 Ctrl+C

# 2. 进入项目目录
cd D:\长期目标网站

# 3. 启动开发服务器
npm run dev
```

---

## 第4步：测试 AI 功能

1. **打开浏览器**：访问 http://localhost:3000
2. **登录系统**
3. **创建新目标**：
   - 点击"创建目标"
   - 输入：学习 Python 编程
   - 选择：学习类
   - 点击"下一步：AI分析"
4. **等待 5-10 秒**
5. **查看 AI 分析结果** 🎉

---

## ✅ 优势

使用官方 API 的好处：

1. **稳定可靠**：官方服务，99.9% 可用性
2. **速度快**：通常 5-10 秒返回结果
3. **功能全**：支持所有最新功能
4. **价格低**：1元可以用很久
5. **无需等待**：立即可用

---

## 📊 API 格式变化

### 学校 API（Ollama 格式）
```javascript
// 请求
{
  model: "deepseek-r1:70b",
  prompt: "你好",
  stream: false
}
// 认证头
X-API-Key: api-key
```

### 官方 API（OpenAI 格式）
```javascript
// 请求
{
  model: "deepseek-chat",
  messages: [
    { role: "system", content: "系统提示" },
    { role: "user", content: "你好" }
  ],
  temperature: 0.7
}
// 认证头
Authorization: Bearer sk-xxxxx
```

---

## 🔧 已修改的文件

1. ✅ `src/config/deepseek.js` - 改回 OpenAI 格式
2. ✅ `vite.config.js` - 移除代理配置
3. ⏳ `.env` - 需要你手动配置 API Key

---

## ❓ 常见问题

### Q: 我没有国外信用卡怎么办？
A: DeepSeek 支持支付宝充值，非常方便。

### Q: API Key 会泄露吗？
A: `.env` 文件已在 `.gitignore` 中，不会提交到 Git。

### Q: 如果想切回学校 API 怎么办？
A: 等学校 API 修复后，我可以帮你切回去。

### Q: 费用大概多少？
A: 
- 创建一个目标的 AI 分析：约 1000 tokens = 0.001 元
- 1 元可以创建约 1000 个目标
- 非常便宜！

---

**配置完成后，立即告诉我测试结果！** 🚀

