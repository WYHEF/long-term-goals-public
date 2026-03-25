# 📁 项目结构说明

本文档说明了项目的文件夹结构和文件组织方式。

## 🏗️ 目录结构

```
长期目标网站/
├── 📚 docs/                    # 文档目录
│   ├── 🔧 setup/              # 配置相关文档
│   │   ├── ADMIN_SETUP.md     # 管理员设置指南
│   │   ├── EMAIL_REMINDER_SETUP.md  # 邮件提醒配置
│   │   ├── GITHUB_ACTIONS_SETUP.md  # GitHub Actions配置
│   │   ├── BACKUP_CRON_SERVICES.md  # 备用定时服务配置
│   │   └── 官方API配置说明.md  # API配置说明
│   ├── 📡 api/                # API相关文档
│   │   ├── API测试说明.md     # API测试文档
│   │   ├── Ollama_API修复说明.md  # Ollama API修复
│   │   └── 学校API问题报告.md  # 学校API问题
│   ├── ✨ features/           # 功能说明文档
│   │   ├── 倒数日功能说明.md   # 倒数日功能
│   │   └── 目标性质功能说明.md  # 目标性质功能
│   ├── 🚀 deployment/         # 部署相关文档
│   │   ├── DEPLOYMENT.md      # 部署指南
│   │   ├── DEPLOYMENT_GUIDE.md # 详细部署指南
│   │   ├── README_DEPLOYMENT.md # 部署说明
│   │   └── deploy-checklist.md # 部署检查清单
│   ├── CHANGELOG.md           # 变更日志
│   ├── CHANGELOG_持续性任务改进.md
│   ├── CHANGELOG_暗色模式修复.md
│   ├── PROJECT_GUIDE.md       # 项目指南
│   ├── PROJECT_SUMMARY.md     # 项目总结
│   ├── QUICK_START.md         # 快速开始
│   └── TODO.md               # 待办事项
├── 📜 scripts/                # 脚本文件
│   ├── check-tasks.js         # 任务检查脚本
│   └── test-email.js          # 邮件测试脚本
├── 🖼️ assets/                 # 静态资源
│   ├── 星煜凡程.png           # 项目Logo
│   └── 星煜凡程透明.png        # 透明Logo
├── 💻 src/                    # 前端源代码
├── 🔌 api/                    # 后端API接口
├── 🗄️ database/               # 数据库相关文件
├── ⚙️ .github/                # GitHub配置
├── 📋 README.md               # 项目说明
├── 📦 package.json            # 项目依赖
├── 🔧 vite.config.js          # Vite配置
├── 🎨 tailwind.config.js      # Tailwind配置
├── 📄 vercel.json             # Vercel配置
└── 🌐 index.html              # 入口页面
```

## 📝 文件分类说明

### 📚 docs/ - 文档目录
所有项目文档都放在这里，按功能分类：
- **setup/**: 各种配置和设置相关的文档
- **api/**: API相关的文档和问题报告
- **features/**: 功能说明和使用指南
- **deployment/**: 部署相关的所有文档

### 📜 scripts/ - 脚本目录
存放各种工具脚本：
- 数据检查脚本
- 测试脚本
- 维护脚本

### 🖼️ assets/ - 资源目录
存放静态资源文件：
- 图片
- 图标
- 其他媒体文件

### 💻 核心代码目录
- **src/**: 前端Vue.js源代码
- **api/**: 后端API接口代码
- **database/**: 数据库相关文件

## 🎯 整理原则

1. **按功能分类**: 相关文件放在一起
2. **层次清晰**: 不超过3层目录结构
3. **命名规范**: 使用清晰的文件夹和文件名
4. **易于维护**: 新文件有明确的归属位置

## 📋 维护建议

- 新增配置文档 → `docs/setup/`
- 新增功能文档 → `docs/features/`
- 新增脚本文件 → `scripts/`
- 新增图片资源 → `assets/`
- 根目录只保留核心配置文件

---

*最后更新: 2025-11-26*
