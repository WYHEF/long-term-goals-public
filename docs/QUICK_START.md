# 🚀 快速开始指南

## 第一步：安装依赖

```bash
npm install
```

## 第二步：配置 Supabase

### 1. 创建 Supabase 项目

访问 https://supabase.com/ 并：
- 注册/登录账号
- 点击 "New Project"
- 填写项目信息（名称、密码、地区）
- 等待项目初始化（约2分钟）

### 2. 获取配置信息

在 Supabase Dashboard：
1. 进入 **Settings** → **API**
2. 复制以下信息：
   - **Project URL**（如：https://xxxxx.supabase.co）
   - **anon/public** key

### 3. 执行数据库脚本

1. 在 Supabase Dashboard，进入 **SQL Editor**
2. 点击 "New query"
3. 打开本项目的 `database/schema.sql` 文件
4. 复制所有内容
5. 粘贴到 SQL Editor 并点击 "Run" 执行

✅ 看到 "Success" 表示数据库配置完成！

## 第三步：配置环境变量

1. 复制 `.env` 文件（已创建）
2. 打开 `.env` 文件
3. 填入你的 Supabase 配置：

```env
VITE_SUPABASE_URL=你的Project_URL
VITE_SUPABASE_ANON_KEY=你的anon_key
```

### DeepSeek API（可选）

如果你有学校提供的 DeepSeek API Key：

```env
VITE_DEEPSEEK_API_KEY=你的api_key
```

> 💡 如果暂时没有 API Key，可以先不配置，系统会提示但不影响其他功能。

## 第四步：启动项目

```bash
npm run dev
```

看到类似提示：
```
  VITE v5.1.5  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## 第五步：访问网站

在浏览器打开：http://localhost:3000

## 首次使用

### 1. 注册账号
- 点击"注册"
- 输入邮箱和密码（密码至少6位）
- 注册成功后自动登录

### 2. 创建第一个目标
- 点击"创建新目标"
- 输入目标名称（如"考英语四级"）
- 选择目标类型（学习类/健康类）
- 等待 AI 分析（如果配置了 API）
- 填写详细信息
- 确认并启动

### 3. 每日打卡
- 在"今日任务"页面
- 点击"去打卡"
- 填写今天的完成情况
- 提交

### 4. 查看进度
- 在"目标管理"查看所有目标
- 点击目标查看详细进度
- 在"数据统计"查看总体情况

## 🎉 恭喜！

你已经成功启动项目！开始你的成长之旅吧！

---

## 📱 手机访问

### 方法一：同一局域网
1. 确保手机和电脑在同一 WiFi
2. 运行 `npm run dev -- --host`
3. 找到 Network 地址（如 192.168.x.x:3000）
4. 在手机浏览器输入这个地址

### 方法二：部署到线上
参考 `DEPLOYMENT.md` 部署到 Vercel，然后手机访问线上地址。

---

## ❓ 常见问题

### Q1: npm install 很慢怎么办？

使用国内镜像源：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### Q2: 无法连接 Supabase？

- 检查 `.env` 配置是否正确
- 确认 Supabase 项目状态正常
- 检查网络连接

### Q3: AI 功能报错？

- 如果没有配置 DeepSeek API Key，这是正常的
- 可以手动填写计划，不影响其他功能
- 或者联系学校获取 API Key

### Q4: 数据丢失了？

- 数据保存在 Supabase 云端
- 只要用同一账号登录，数据会自动同步
- 建议定期在"设置"页面导出备份

### Q5: 想要深色主题？

深色主题正在开发中，敬请期待！

---

## 🆘 需要帮助？

查看详细文档：
- `README.md` - 项目介绍
- `PROJECT_GUIDE.md` - 项目指南
- `DEPLOYMENT.md` - 部署指南

---

**祝你使用愉快！** 🚀

