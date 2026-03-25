# 📧 邮件提醒功能配置说明

## 功能说明

每天北京时间 **8:50**、**20:50** 和 **22:50** 自动发送邮件提醒，通知用户今天截止的目标。

---

## 环境变量配置

需要在 Vercel Dashboard 中配置以下环境变量：

### 1. Supabase 配置（已有）
```
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

### 2. Supabase Service Key（新增）⚠️
```
SUPABASE_SERVICE_KEY=你的Supabase服务密钥
```

**获取方式**：
1. 登录 Supabase Dashboard
2. 进入项目设置 → API
3. 复制 `service_role` 密钥（⚠️ 这是敏感信息，不要泄露！）

**为什么需要**：Service Key 可以绕过 RLS（行级安全策略），允许服务端查询所有用户数据。

### 3. Resend API Key（新增）
```
RESEND_API_KEY=your-resend-api-key
```

**已配置**：你的 API Key 已经提供。

### 4. Cron 安全密钥（新增）
```
CRON_SECRET=生成一个随机字符串
```

**生成方式**：
```bash
# 在终端运行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**作用**：防止 Cron 接口被恶意调用。

---

## Vercel 配置步骤

### 步骤 1：添加环境变量

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `SUPABASE_SERVICE_KEY` | 从 Supabase 获取 | Production, Preview, Development |
| `RESEND_API_KEY` | `your-resend-api-key` | Production, Preview, Development |
| `CRON_SECRET` | 生成的随机字符串 | Production, Preview, Development |

### 步骤 2：部署项目

```bash
# 提交代码
git add .
git commit -m "添加邮件提醒功能"
git push

# Vercel 会自动部署
```

### 步骤 3：启用 Cron Jobs

⚠️ **重要**：Vercel 的 Cron Jobs 功能需要在 **Pro 计划**或以上才能使用。

**免费版替代方案**：
- 使用外部 Cron 服务（如 cron-job.org）定时调用 API
- 使用 GitHub Actions 定时触发

---

## 测试邮件功能

### 手动测试

创建测试脚本 `test-email.js`：

```javascript
const CRON_SECRET = '你的CRON_SECRET'
const API_URL = 'https://你的域名.vercel.app/api/cron/send-reminders'

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CRON_SECRET}`
  }
})
  .then(res => res.json())
  .then(data => console.log('✅ 测试成功:', data))
  .catch(err => console.error('❌ 测试失败:', err))
```

运行测试：
```bash
node scripts/test-email.js
```

### 查看日志

在 Vercel Dashboard 中：
1. 进入项目
2. 点击 **Functions**
3. 找到 `send-reminders` 函数
4. 查看执行日志

---

## 邮件内容说明

邮件包含以下内容：
1. **倒计时提醒**：距离今天结束还有X小时
2. **目标列表**：今天截止的所有目标
3. **每日任务**：从目标的 `plan.dailyTasks` 中提取
4. **立即打卡按钮**：跳转到网站

---

## 定时任务时间说明

```
schedule: "50 0,12,14 * * *"
```

- `50 0 * * *`：每天 UTC 0:50（北京时间 8:50）
- `50 12 * * *`：每天 UTC 12:50（北京时间 20:50）
- `50 14 * * *`：每天 UTC 14:50（北京时间 22:50）

**Cron 表达式格式**：
```
分钟 小时 日期 月份 星期
0-59 0-23 1-31 1-12 0-6
```

---

## 自定义邮件域名（可选）

### 使用自己的域名发送邮件

1. 在 Resend Dashboard 中添加域名 `wyhef.cloud`
2. 添加 DNS 记录（Resend 会提供）
3. 验证域名
4. 修改代码中的 `from` 字段：
   ```javascript
   from: '星煜凡程 <noreply@wyhef.cloud>'
   ```

---

## 常见问题

### Q1: 为什么没有收到邮件？

**检查清单**：
1. ✅ 环境变量是否正确配置
2. ✅ Supabase Service Key 是否正确
3. ✅ Resend API Key 是否有效
4. ✅ 今天是否有截止的目标
5. ✅ 用户邮箱是否正确
6. ✅ 检查垃圾邮件箱

### Q2: Vercel 免费版不支持 Cron Jobs 怎么办？

**方案 1**：使用 GitHub Actions

创建 `.github/workflows/send-reminders.yml`：
```yaml
name: Send Email Reminders

on:
  schedule:
    - cron: '50 0,12,14 * * *'  # UTC 0:50, 12:50 和 14:50

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Call API
        run: |
          curl -X POST https://你的域名.vercel.app/api/cron/send-reminders \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

**方案 2**：使用 cron-job.org（免费）
1. 注册 https://cron-job.org
2. 创建新任务
3. URL: `https://你的域名.vercel.app/api/cron/send-reminders`
4. 添加 Header: `Authorization: Bearer 你的CRON_SECRET`
5. 设置时间：每天 0:50、12:50 和 14:50 UTC

### Q3: 如何修改邮件内容？

编辑 `api/cron/send-reminders.js` 中的 `generateEmailHtml` 函数。

---

## 下一步优化

- [ ] 添加用户邮件偏好设置（允许用户关闭提醒）
- [ ] 支持自定义提醒时间
- [ ] 添加周报/月报邮件
- [ ] 支持企业微信提醒（可选）

---

## 技术支持

如有问题，请查看：
- Vercel 日志
- Supabase 日志
- Resend Dashboard

---

**配置完成后，记得测试一下！** 🎉
