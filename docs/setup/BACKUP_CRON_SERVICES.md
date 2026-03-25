# 📋 备用定时服务配置参考

本文档提供了使用外部定时服务的配置方法，作为 GitHub Actions 的备用方案。

> **当前状态**：项目使用 GitHub Actions 作为主要定时服务。如果遇到延迟问题，可参考本文档配置备用服务。

## 🚀 完整设置步骤

### 步骤 1：注册 cron-job.org
1. 访问：https://cron-job.org/en/signup
2. 填写邮箱和密码注册
3. 验证邮箱（检查垃圾邮件箱）
4. 登录到控制面板

### 步骤 2：获取你的 CRON_SECRET

从 Vercel 环境变量中，你的 `CRON_SECRET` 值是：**（请点击 CRON_SECRET 右侧的眼睛图标查看完整值）**

### 步骤 3：创建定时任务

在 cron-job.org 控制面板中，点击 **"Create cronjob"** 按钮，然后创建以下 3 个任务：

#### 🌅 任务 1：早上提醒（北京时间 9:00 - 备份系统）

**基本设置：**
- **Title**: `邮件提醒备份 - 早上 9:00`
- **URL**: `https://goals.wyhef.cloud/api/cron/send-reminders`
- **Request method**: `POST`

**时间设置：**
- **Minutes**: `0`
- **Hours**: `1` （UTC 时间）
- **Days**: `*` （每天）
- **Months**: `*` （每月）
- **Weekdays**: `*` （每周）

**Headers（点击 "Request headers" 添加）：**
```
Authorization: Bearer [你的CRON_SECRET值]
Content-Type: application/json
```

#### 🌆 任务 2：晚上提醒（北京时间 21:00 - 备份系统）

**基本设置：**
- **Title**: `邮件提醒备份 - 晚上 21:00`
- **URL**: `https://goals.wyhef.cloud/api/cron/send-reminders`
- **Request method**: `POST`

**时间设置：**
- **Minutes**: `0`
- **Hours**: `13` （UTC 时间）
- **Days**: `*`
- **Months**: `*`
- **Weekdays**: `*`

**Headers：**
```
Authorization: Bearer [你的CRON_SECRET值]
Content-Type: application/json
```

#### 🌙 任务 3：夜间提醒（北京时间 23:00 - 备份系统）

**基本设置：**
- **Title**: `邮件提醒备份 - 夜间 23:00`
- **URL**: `https://goals.wyhef.cloud/api/cron/send-reminders`
- **Request method**: `POST`

**时间设置：**
- **Minutes**: `0`
- **Hours**: `15` （UTC 时间）
- **Days**: `*`
- **Months**: `*`
- **Weekdays**: `*`

**Headers：**
```
Authorization: Bearer [你的CRON_SECRET值]
Content-Type: application/json
```

### 3. 获取 CRON_SECRET

从 Vercel 环境变量中获取 `CRON_SECRET` 的值。

## 优势

- ✅ **精确时间**：延迟通常在几秒内
- ✅ **高可靠性**：专业的定时服务
- ✅ **免费使用**：基础功能完全免费
- ✅ **监控功能**：可以查看执行历史和状态

## ⏰ 当前 GitHub Actions 配置

| UTC 时间 | 北京时间 | 说明 |
|---------|---------|------|
| 00:00 | 08:00 | 早上提醒 |
| 12:00 | 20:00 | 晚上提醒 |
| 14:00 | 22:00 | 夜间提醒 |

> **优化说明**：时间已提前1小时，以应对 GitHub Actions 可能的延迟。即使延迟1-2小时，也能在合理时间内收到邮件。

## 🔄 备用 cron-job.org 配置（可选）

如果需要更精确的时间控制，可以配置以下备用系统：

### 步骤 4：测试定时任务

创建任务后，你可以立即测试：
1. 在 cron-job.org 控制面板中，找到刚创建的任务
2. 点击任务右侧的 **"Execute now"** 按钮
3. 查看执行结果，应该显示 HTTP 200 状态码
4. 检查你的邮箱是否收到测试邮件

### 步骤 5：监控双重系统

设置完成后，你可以监控两套系统的运行情况：

**GitHub Actions 监控：**
1. 访问 GitHub 仓库的 Actions 页面
2. 查看 "发送邮件提醒" 工作流的执行历史
3. 检查是否有执行失败的情况

**cron-job.org 监控：**
1. 登录 cron-job.org 控制面板
2. 查看每个任务的执行历史
3. 检查响应时间和状态码

## 🎯 完成！

当前邮件提醒时间：
- **北京时间 8:00**（早上提醒）
- **北京时间 20:00**（晚上提醒）
- **北京时间 22:00**（夜间提醒）

> 如果配置了 cron-job.org 备用系统，将在 9:00/21:00/23:00 提供备份保障。

## 📊 监控和维护

### 查看执行历史
在 cron-job.org 控制面板中，你可以：
- 查看每次执行的状态
- 查看响应时间和状态码
- 接收执行失败的邮件通知

### 如果出现问题
1. **检查 CRON_SECRET 是否正确**
2. **确认 URL 是否可访问**
3. **查看 cron-job.org 的执行日志**
4. **检查 Vercel 的 Function 日志**
