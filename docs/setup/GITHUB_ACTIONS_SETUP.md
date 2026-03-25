# 🤖 GitHub Actions 邮件提醒配置指南

## 为什么使用 GitHub Actions？

Vercel 免费版不支持 Cron Jobs，但 GitHub Actions 完全免费且可靠！

---

## 📋 配置步骤

### 第一步：生成 CRON_SECRET

在终端运行以下命令生成随机密钥：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**示例输出**：
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

复制这个字符串，待会要用。

---

### 第二步：在 GitHub 添加 Secret

1. 打开你的 GitHub 仓库页面
2. 点击 **Settings**（设置）
3. 左侧菜单找到 **Secrets and variables** → **Actions**
4. 点击 **New repository secret**
5. 添加以下 Secret：

| Name | Value |
|------|-------|
| `CRON_SECRET` | 刚才生成的随机字符串 |

**示例**：
- Name: `CRON_SECRET`
- Secret: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`

点击 **Add secret** 保存。

---

### 第三步：在 Vercel 添加环境变量

登录 Vercel Dashboard，添加以下环境变量：

1. 进入你的项目
2. 点击 **Settings** → **Environment Variables**
3. 添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `SUPABASE_SERVICE_KEY` | 从 Supabase 获取 | 在 Supabase Dashboard → Settings → API → service_role key |
| `RESEND_API_KEY` | `your-resend-api-key` | 从 Resend Dashboard 获取 |
| `CRON_SECRET` | 与 GitHub Secret 相同的值 | 用于验证请求 |

**重要**：`CRON_SECRET` 在 GitHub 和 Vercel 中必须完全一致！

---

### 第四步：部署代码

```bash
# 1. 添加所有文件
git add .

# 2. 提交
git commit -m "添加邮件提醒功能和GitHub Actions配置"

# 3. 推送到 GitHub
git push
```

---

### 第五步：启用 GitHub Actions

1. 推送代码后，GitHub 会自动检测到 workflow 文件
2. 访问你的仓库页面
3. 点击顶部的 **Actions** 标签
4. 你会看到 "发送邮件提醒" 工作流

**GitHub Actions 会自动在以下时间运行**：
- 每天北京时间 9:00（UTC 1:00）
- 每天北京时间 21:00（UTC 13:00）

---

## 🧪 测试功能

### 方法一：手动触发（推荐）

1. 进入 GitHub 仓库的 **Actions** 页面
2. 点击左侧的 "发送邮件提醒"
3. 点击右侧的 **Run workflow** 按钮
4. 点击绿色的 **Run workflow** 确认
5. 等待几秒，查看运行结果

### 方法二：使用测试脚本

创建 `test-email.js` 文件：

```javascript
const CRON_SECRET = '你的CRON_SECRET'

fetch('https://goals.wyhef.cloud/api/cron/send-reminders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CRON_SECRET}`,
    'Content-Type': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ 测试成功:', data)
  })
  .catch(err => {
    console.error('❌ 测试失败:', err)
  })
```

运行测试：
```bash
node test-email.js
```

---

## 📊 查看运行日志

### GitHub Actions 日志

1. 进入仓库的 **Actions** 页面
2. 点击任意一次运行记录
3. 点击 "发送邮件提醒" 查看详细日志
4. 可以看到：
   - HTTP 状态码
   - 发送了多少封邮件
   - 是否有错误

### Vercel 函数日志

1. 登录 Vercel Dashboard
2. 进入项目
3. 点击 **Functions** 标签
4. 找到 `send-reminders` 函数
5. 查看执行日志

---

## ⏰ 定时任务说明

### Cron 表达式

```yaml
schedule:
  - cron: '0 1 * * *'   # 每天 UTC 1:00 (北京时间 9:00)
  - cron: '0 13 * * *'  # 每天 UTC 13:00 (北京时间 21:00)
```

### Cron 格式说明

```
分钟 小时 日期 月份 星期
 │   │   │   │   │
 │   │   │   │   └─ 0-6 (0=周日)
 │   │   │   └───── 1-12
 │   │   └───────── 1-31
 │   └───────────── 0-23
 └───────────────── 0-59
```

### 修改提醒时间

如果想改变提醒时间，编辑 `.github/workflows/send-email-reminders.yml`：

**示例**：改为每天 8:00 和 20:00
```yaml
schedule:
  - cron: '0 0 * * *'   # UTC 0:00 = 北京时间 8:00
  - cron: '0 12 * * *'  # UTC 12:00 = 北京时间 20:00
```

---

## 🔍 常见问题

### Q1: GitHub Actions 没有自动运行？

**可能原因**：
1. ✅ 检查 workflow 文件路径是否正确：`.github/workflows/send-email-reminders.yml`
2. ✅ 检查 YAML 格式是否正确（缩进很重要！）
3. ✅ 仓库是否为 Public？（Private 仓库有分钟数限制）
4. ✅ 等待几分钟，GitHub 可能有延迟

### Q2: 运行失败，显示 401 Unauthorized？

**原因**：`CRON_SECRET` 不匹配

**解决**：
1. 检查 GitHub Secret 中的 `CRON_SECRET`
2. 检查 Vercel 环境变量中的 `CRON_SECRET`
3. 确保两者完全一致（包括大小写）

### Q3: 运行失败，显示 500 错误？

**可能原因**：
1. Supabase Service Key 配置错误
2. Resend API Key 无效
3. 数据库连接失败

**解决**：
1. 检查 Vercel 环境变量
2. 查看 Vercel 函数日志
3. 确认 Supabase 项目正常运行

### Q4: 没有收到邮件？

**检查清单**：
1. ✅ 今天是否有截止的目标？（在数据库中查看）
2. ✅ 用户邮箱是否正确？
3. ✅ 检查垃圾邮件箱
4. ✅ 查看 GitHub Actions 日志，确认发送成功
5. ✅ 查看 Resend Dashboard，确认邮件已发送

### Q5: GitHub Actions 免费额度够用吗？

**完全够用！**

- 免费额度：每月 2000 分钟
- 每次运行耗时：约 10-30 秒
- 每天运行 2 次：约 1 分钟/天
- 每月消耗：约 30 分钟

**结论**：只用了 1.5% 的免费额度，完全够用！

---

## 📧 邮件内容预览

用户会收到包含以下内容的邮件：

1. **标题**：⏰ 目标截止提醒 - 今天是最后一天！
2. **倒计时**：距离今天结束还有约 X 小时
3. **目标列表**：今天截止的所有目标
4. **每日任务**：每个目标的今日任务清单
5. **立即打卡按钮**：跳转到网站

---

## 🎯 下一步优化

- [ ] 添加用户邮件偏好设置
- [ ] 支持自定义提醒时间
- [ ] 添加周报/月报功能
- [ ] 邮件内容个性化

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 GitHub Actions 运行日志
2. 查看 Vercel 函数日志
3. 检查环境变量配置
4. 确认数据库中有今天截止的目标

---

**配置完成后，记得手动触发一次测试！** 🚀
