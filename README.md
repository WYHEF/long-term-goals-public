# 星煜凡程 ✨

> **凡程蓄力，星途煜辉。**
>
> 本项目的初衷是为了管理作者自己生活中的一些琐碎的事情，每天能量化地看到自己到底做了什么、自己距离自己的目标还有多远的距离，让长期目标也能获得及时反馈。
>
> 就像项目的名字一样，想要改变和照耀这个世界（星煜），必须通过实事求是、脚踏实地的努力去实现（凡程），让长期目标也能获得及时反馈。
>
> 在AI大模型爆发的今天，星煜凡程有个很好的功能，就是通过 [提示词工程] ，使用AI去拆解我们的中长期目标，用AI帮助我们规划、追踪并实现人生中的每一个重要目标。
>
> 项目目前使用的模型：Qwen-3.5-plus
> 
> PS：作者也也有了解到有了更多的优秀的框架，比提示词工程要更加优秀，比如Langchain等，之后会不断进行迭代的，但是我还是把这个有点简陋的版本放出来了，因为这个是我们最基础的提示词工程，这个项目的存在，或许可以帮助我们更改地理解别人优秀的框架，到底解决了什么问题，我们自己写的简陋的工程为什么不行，让自己的学习有 [迭代] 的过程，所以我觉得也是十分有意义的。
>
> 欢迎访问星煜凡程主站尝试：https://goals.wyhef.cloud
>
> 欢迎给作者提交issue或邮件：wyf1992570@163.com

## 📁 项目结构

```
长期目标网站/
├── 📚 docs/           # 📖 项目文档 (配置、API、功能说明等)
├── 📜 scripts/        # 🔧 工具脚本 (任务检查、邮件测试等)  
├── 🖼️ assets/         # 🎨 静态资源 (图片、Logo等)
├── 💻 src/            # ⚡ 前端源代码 (Vue.js)
├── 🔌 api/            # 🌐 后端API接口
├── 🗄️ database/       # 💾 数据库相关文件
└── ⚙️ .github/        # 🤖 GitHub Actions配置
```

> 📋 详细的项目结构说明请查看 [`docs/PROJECT_STRUCTURE.md`](./docs/PROJECT_STRUCTURE.md)

---

## 🌟 项目简介

**星煜凡程** 是一个基于 AI 辅助（当前2.0版本：提示词工程）的智能目标管理系统，专为需要长期坚持的目标而设计。无论是学习新技能、养成健康习惯，还是准备重要考试，星煜凡程都能帮你：

- 🤖 **AI 智能规划**：自动将长期目标拆解为可执行的每日任务
- 📅 **精准追踪**：精确到每一天的计划和打卡记录
- 📊 **可视化进度**：直观的数据展示和趋势分析
- 🎯 **灵活管理**：支持持续性习惯和阶段性目标两种模式
- ⏰ **倒数日提醒**：重要日期一目了然，不错过任何deadline
- 📧 **邮件提醒系统**：自动发送每日目标提醒，确保持续关注

---

## ✨ 核心功能

### 🎯 智能目标创建

- **创建目标**

  - **输入目标基本性质**

  ![image-20260325162346388](https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325162346734.png)

  - **填写目标详情，包括截止日、你的基础信息、你的额外要求、目标的严格程度等**
    - **持续性习惯**：无固定截止日期，培养长期好习惯（如每日阅读、健身等）
    - **阶段性目标**：有明确截止时间的目标（如考试准备、项目完成等）
     ![image-20260325162656127](https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325162656419.png)


- **AI智能规划**
  - 接入 Qwen-3.5-plus AI，智能分析目标可行性
  - 自动拆解为周计划和日计划
  - 根据目标类型生成定制化任务清单
   ![6faf3e92-3d79-4f2c-94e2-7c4fb85c85e5](https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325163238182.png)




- **确认和修改最终计划**
![image-20260325163423239](https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325163423492.png)
![image-20260325163527452](https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325163527865.png)

- **灵活任务管理**

  - 持续性目标支持每日灵活编辑任务
  - 可跳过 AI 规划，手动创建任务模板
  - 支持学习类、健康类、创作类等多种目标类型

### 📊 全面的打卡系统

#### 学习类打卡

- 完成度记录（百分比）

- 学习时长统计

- 富文本笔记编辑

- 附件上传（图片、文件）

  <img src="https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325173654690.png" alt="image-20260325173654503" style="width:55%;" />

#### 健康类打卡（支持累计）

- **喝水记录**：每次喝水都能打卡，累计达标

- **运动记录**：类型、时长、消耗卡路里

- **睡眠记录**：睡眠时长和质量评价

- **体重管理**：体重变化趋势追踪

  <img src="https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325173720196.png" alt="image-20260325173720014" style="width:55%;" />

### 📈 数据可视化

- **今日任务总览**
  
  - 实时显示今日所有目标
  
  - 智能计算今日完成度（正确处理累计任务）
  
  - 快速打卡入口
  
    ![image-20260325172022304](https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325172022555.png)
  
- **目标详情页**
  - 每日计划时间线展示
  
  - 高亮显示当前日期
  
  - 点击查看每日打卡详情
  
  - 完整的打卡历史记录
  
    ![image-20260325172349058](https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325172349298.png)
  
- **打卡热力图**
  - GitHub 风格的热力图日历
  
  - 直观显示打卡频率和连续性

  - 不同颜色表示完成度
  
    ![image-20260325173748626](https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325173748873.png)
  
- **统计分析**
  
  - 目标进度趋势图
  - 完成率分析
  - 周报月报自动生成

### 💡 想法收集箱

- 快速捕捉突发灵感

- 随时记录学习资源

- 一键转换为正式目标

- 支持编辑和分类管理

  ![image-20260325173824513](https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325173824759.png)

### ⏰ 倒数日功能

- **重要日期提醒**
  - 考试倒计时
  
  - 生日纪念日
  
  - 项目deadline
  
  - 自定义重要日期
  
    ![image-20260325164158939](https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325164159192.png)
  
- **AI智能提取信息**
  
  - 填入信息，AI自动提取倒数日标题、日程信息、截止时间、倒数日性质等
  
    <img src="https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325164621858.png" alt="image-20260325164621671" style="width:55%;" />
  
- **美观的卡片展示**

  - 不同类型不同颜色主题

  - 剩余天数/已过天数自动计算

  - 首页显示最近的重要日期

  - 独立的倒数日管理页面

    ![image-20260325173917749](https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325173918006.png)

### 📧 智能邮件提醒

- **自动提醒系统**
  - 每日定时发送邮件提醒（北京时间 8:00、20:00、22:00）
  
  - 基于 GitHub Actions 的可靠定时任务

  - 智能识别今天截止的重要日期
  
    ![image-20260325174016752](https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325174017018.png)
  
- **个性化内容**
  - 显示今天到期的倒数日事项
  - 包含用户的每日任务清单
  - 剩余时间倒计时提醒
  - 美观的 HTML 邮件模板

- **灵活配置**
  
  - 支持备用定时服务（cron-job.org）
  
  - 可调整提醒时间和频率
  
  - 邮件发送状态监控
  
  - 失败重试机制
  
    ![image-20260325174114847](https://cdn.jsdelivr.net/gh/WYHEF/my_images/img/20260325174115092.png)

### 🔐 管理员面板

- **数据总览**
  - 用户统计（总数、今日新增、活跃用户）
  - 目标统计（总数、今日创建、完成率）
  - 打卡统计（总数、今日打卡、连续打卡）

- **用户管理**
  - 查看所有用户信息
  - 用户目标和打卡统计
  - 搜索和筛选功能

- **目标管理**
  - 查看所有目标
  - 按状态、类型筛选
  - 目标详情查看

- **打卡监控**
  - 实时打卡记录
  - 按目标、日期筛选
  - 打卡数据分析

- **公告管理**
  - 发布系统公告
  - 设置公告优先级
  - 公告的编辑和删除
  - 用户端自动展示

- **系统设置**
  - 注册开关控制
  - AI 功能开关
  - 数据导出功能
  - 系统维护模式

### 🌙 深色模式

- **智能主题切换**
  - 一键切换浅色/深色模式
  - 主题偏好自动保存
  - 全局统一的视觉体验
  - 保护眼睛，适合夜间使用
- **完整的深色适配**
  - 所有页面完美支持深色模式
  - 卡片、按钮、输入框等组件全面适配
  - 保持良好的对比度和可读性
  - 平滑的主题切换动画

---

## 🛠 技术栈

### 前端技术
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **UI 框架**: Tailwind CSS
- **图表库**: ECharts + Vue-ECharts
- **日期处理**: Day.js
- **HTTP 客户端**: Axios

### 后端服务
- **BaaS 平台**: Supabase
- **数据库**: PostgreSQL
- **认证系统**: Supabase Auth
- **存储**: Supabase Storage
- **实时功能**: Supabase Realtime
- **邮件服务**: Resend API
- **定时任务**: GitHub Actions + Vercel Functions

### AI 集成
- **AI 模型**: DeepSeek API
- **应用场景**: 目标可行性分析、任务拆解、计划生成

---

## 📦 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/xingyufancheng.git
cd xingyufancheng
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env` 文件并配置以下内容：

```bash
# Supabase 配置
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥

# DeepSeek API 配置
VITE_DEEPSEEK_API_KEY=你的DeepSeek_API密钥

# 邮件提醒配置（用于 Vercel Functions）
RESEND_API_KEY=你的Resend_API密钥
SUPABASE_SERVICE_KEY=你的Supabase服务密钥
CRON_SECRET=随机生成的密钥
```

**获取方式：**
- Supabase: 访问 [supabase.com](https://supabase.com/) 创建项目
- DeepSeek: 访问 [platform.deepseek.com](https://platform.deepseek.com/) 获取 API Key
- Resend: 访问 [resend.com](https://resend.com/) 注册并获取 API Key
- CRON_SECRET: 使用 `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` 生成

### 4. 初始化数据库

在 Supabase 项目的 SQL Editor 中依次执行以下脚本：

```bash
database/schema.sql                    # 主数据表
database/admin_schema.sql              # 管理员相关表
database/migrations/add_goal_nature.sql     # 目标性质字段
database/migrations/add_countdowns.sql      # 倒数日功能
```

### 5. 配置管理员

执行以下 SQL 添加管理员（替换为你的用户ID）：

```sql
INSERT INTO admins (user_id, role, permissions)
VALUES ('你的用户ID', 'super_admin', '["all"]');
```

### 6. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 7. 配置邮件提醒（可选）

如需启用邮件提醒功能，请参考以下文档：
- [邮件提醒配置指南](./docs/setup/EMAIL_REMINDER_SETUP.md)
- [GitHub Actions 配置](./docs/setup/GITHUB_ACTIONS_SETUP.md)
- [备用定时服务配置](./docs/setup/BACKUP_CRON_SERVICES.md)

### 8. 构建生产版本

```bash
npm run build
```

---

## 📁 项目结构

```
星煜凡程/
├── database/                    # 数据库相关
│   ├── schema.sql              # 主数据表结构
│   ├── admin_schema.sql        # 管理员表结构
│   └── migrations/             # 数据库迁移脚本
│       ├── add_goal_nature.sql
│       └── add_countdowns.sql
├── src/
│   ├── assets/                 # 静态资源
│   │   └── styles/
│   │       └── main.css        # 全局样式
│   ├── components/             # 可复用组件
│   │   ├── GoalCard.vue        # 目标卡片
│   │   ├── GoalTaskCard.vue    # 今日任务卡片
│   │   ├── CheckInHistory.vue  # 打卡历史
│   │   ├── HeatmapCalendar.vue # 热力图日历
│   │   ├── CountdownCard.vue   # 倒数日卡片
│   │   ├── RichNoteEditor.vue  # 富文本编辑器
│   │   └── QuickInputModal.vue # 快速输入模态框
│   ├── config/                 # 配置文件
│   │   ├── supabase.js         # Supabase 配置
│   │   └── deepseek.js         # DeepSeek API 配置
│   ├── layouts/                # 布局组件
│   │   ├── MainLayout.vue      # 主布局
│   │   └── AdminLayout.vue     # 管理员布局
│   ├── router/                 # 路由配置
│   │   └── index.js
│   ├── stores/                 # Pinia 状态管理
│   │   ├── user.js             # 用户状态
│   │   ├── goals.js            # 目标管理
│   │   ├── checkins.js         # 打卡记录
│   │   ├── ideas.js            # 想法收集箱
│   │   ├── countdowns.js       # 倒数日管理
│   │   └── admin.js            # 管理员功能
│   ├── utils/                  # 工具函数
│   │   └── export.js           # 数据导出
│   ├── views/                  # 页面组件
│   │   ├── auth/               # 认证页面
│   │   │   └── LoginView.vue
│   │   ├── goals/              # 目标相关页面
│   │   │   ├── GoalsView.vue       # 目标列表
│   │   │   ├── CreateGoalView.vue  # 创建目标
│   │   │   └── GoalDetailView.vue  # 目标详情
│   │   ├── admin/              # 管理员页面
│   │   │   ├── DashboardView.vue
│   │   │   ├── UsersView.vue
│   │   │   ├── GoalsView.vue
│   │   │   ├── CheckInsView.vue
│   │   │   ├── AnnouncementsView.vue
│   │   │   └── SystemSettingsView.vue
│   │   ├── TodayView.vue       # 今日任务
│   │   ├── CheckInView.vue     # 打卡页面
│   │   ├── StatisticsView.vue  # 统计分析
│   │   ├── IdeasView.vue       # 想法收集箱
│   │   ├── CountdownsView.vue  # 倒数日管理
│   │   ├── SettingsView.vue    # 个人设置
│   │   ├── TermsView.vue       # 服务条款
│   │   └── PrivacyView.vue     # 隐私政策
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口文件
├── index.html                  # HTML 模板
├── package.json                # 项目配置
├── vite.config.js              # Vite 配置
├── tailwind.config.js          # Tailwind 配置
├── postcss.config.js           # PostCSS 配置
└── README.md                   # 项目说明
```

---

## 🎨 设计理念

### UI/UX 设计原则
- **简约现代**: 借鉴 Notion 的极简设计风格
- **专注内容**: 减少视觉干扰，突出核心信息
- **响应式设计**: 完美适配桌面端和移动端
- **直观交互**: 清晰的信息层级，流畅的操作体验

### 色彩系统
- **主色调**: 靛蓝色（专业、可信赖）
- **辅助色**: 紫色（创意、灵感）
- **强调色**: 翠绿色（成长、完成）
- **警示色**: 琥珀色（提醒、注意）

---

## 🔒 数据安全

- **用户认证**: 基于 Supabase Auth 的安全认证系统
- **数据隔离**: 严格的 Row Level Security (RLS) 策略
- **权限管理**: 基于角色的访问控制（RBAC）
- **数据备份**: 定期自动备份机制

---

## 📱 移动端支持

网站采用响应式设计，完美支持移动设备：

- 📱 **自适应布局**: 自动适配不同屏幕尺寸
- 👆 **触摸优化**: 针对移动端优化的交互体验
- 🔄 **底部导航**: 移动端显示固定底部导航栏
- ⚡ **性能优化**: 轻量级设计，快速加载

---

## 📚 使用文档

### 📖 基础文档
- [快速开始指南](./docs/QUICK_START.md)
- [项目指南](./docs/PROJECT_GUIDE.md)
- [项目总结](./docs/PROJECT_SUMMARY.md)
- [项目结构说明](./docs/PROJECT_STRUCTURE.md)

### 🔧 配置文档
- [邮件提醒配置指南](./docs/setup/EMAIL_REMINDER_SETUP.md)
- [GitHub Actions 配置](./docs/setup/GITHUB_ACTIONS_SETUP.md)
- [管理员设置](./docs/setup/ADMIN_SETUP.md)
- [备用定时服务配置](./docs/setup/BACKUP_CRON_SERVICES.md)

### ✨ 功能文档
- [目标性质功能说明](./docs/features/目标性质功能说明.md)
- [倒数日功能说明](./docs/features/倒数日功能说明.md)

### 🚀 部署文档
- [部署指南](./docs/deployment/DEPLOYMENT_GUIDE.md)
- [部署检查清单](./docs/deployment/deploy-checklist.md)

### 📡 API文档
- [API测试说明](./docs/api/API测试说明.md)
- [Ollama API修复说明](./docs/api/Ollama_API修复说明.md)

---

## 🚀 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 一键部署完成

### 其他平台

项目支持部署到任何支持静态网站的平台：
- Netlify
- Cloudflare Pages
- GitHub Pages
- 自建服务器

详细部署步骤请参考 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交 Issue
- Bug 报告请包含详细的复现步骤
- 功能建议请说明使用场景和预期效果

### 提交 PR
- Fork 本项目
- 创建特性分支 (`git checkout -b feature/AmazingFeature`)
- 提交更改 (`git commit -m 'Add some AmazingFeature'`)
- 推送到分支 (`git push origin feature/AmazingFeature`)
- 开启 Pull Request

---

## 📄 开源协议

本项目采用 [MIT License](./LICENSE) 开源协议。

---

## 🙏 致谢

感谢以下开源项目：
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Supabase](https://supabase.com/) - 开源的 Firebase 替代方案
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [DeepSeek](https://www.deepseek.com/) - 强大的 AI 能力支持
- [ECharts](https://echarts.apache.org/) - 专业的数据可视化库

---

## 📮 联系方式

- **项目主页**: [GitHub Repository](https://github.com/WYHEF/long-term-goals-public)
- **问题反馈**: [Issues](https://github.com/WYHEF/long-term-goals-public/issues)
- **功能建议**: [Discussions](https://github.com/WYHEF/long-term-goals-public/discussions)

---

<div align="center">
**⭐ 如果这个项目对你有帮助，欢迎点个 Star！⭐**

---

### ✨ 星煜凡程 ✨

**凡程蓄力，星途煜辉。**

*在每一个平凡的旅程中积蓄力量，*  
*让你的星辰之路熠熠生辉。*

---

Made with ❤️ by 星煜凡程团队

**让每一个目标都能闪耀光芒，让每一步坚持都有意义！**

</div>
