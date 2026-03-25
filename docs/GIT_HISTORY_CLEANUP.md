# 🔒 Git 历史清理指南

## ⚠️ 重要警告

**在开源此项目之前，必须清理 Git 历史中的敏感信息！**

当前 Git 历史中包含以下已泄露的敏感信息：
- ✅ DeepSeek API Key: `sk-fadfc5f54bd04bc198999a1502252a25`（在初始提交中）
- ✅ Supabase URL 和 ANON_KEY（在初始提交中）

---

## 🚨 立即采取的措施

### 1. 撤销已泄露的密钥（**必须**）

#### DeepSeek API Key
1. 登录 https://platform.deepseek.com/
2. 进入 API Keys 管理页面
3. 删除或重新生成密钥：`sk-fadfc5f54bd04bc198999a1502252a25`

#### Supabase（可选，因为 ANON_KEY 是公开的）
- Supabase ANON_KEY 是设计为公开的，但建议检查：
  - 确保没有暴露 service_role key
  - 检查 RLS (Row Level Security) 策略是否正确配置

---

## 🛠️ 清理 Git 历史的方法

### 方法一：使用 BFG Repo-Cleaner（推荐，最简单）

#### 步骤 1：安装 BFG
```bash
# macOS
brew install bfg

# Windows (使用 Chocolatey)
choco install bfg

# 或下载 jar 文件
# https://rtyley.github.io/bfg-repo-cleaner/
```

#### 步骤 2：创建密钥列表文件
创建 `secrets.txt` 文件，包含所有需要删除的敏感信息：
```
sk-fadfc5f54bd04bc198999a1502252a25
fsonawgyuqwnshhcsszq.supabase.co
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb25hd2d5dXF3bnNoaGNzc3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDM0MzEsImV4cCI6MjA3NzQxOTQzMX0.yfvR0wZafijdH7XQyz0hyGxX2LVVMxUqn0sWDiVn54M
```

#### 步骤 3：清理历史
```bash
# 克隆仓库的镜像副本
git clone --mirror https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 运行 BFG 清理
bfg --replace-text secrets.txt YOUR_REPO.git

# 清理 reflog 和垃圾回收
cd YOUR_REPO.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 强制推送（⚠️ 会覆盖远程仓库）
git push --force
```

---

### 方法二：使用 git filter-branch（原生 Git）

```bash
# 创建替换脚本 replace-secrets.sh
#!/bin/bash
git filter-branch --force --index-filter \
  'git ls-files -s | sed "s|sk-fadfc5f54bd04bc198999a1502252a25|your-api-key|g" | \
   git update-index --index-info' \
  --prune-empty --tag-name-filter cat -- --all
```

---

### 方法三：从头开始（最干净）

如果不想保留历史，可以：

```bash
# 1. 删除 .git 目录
rm -rf .git

# 2. 重新初始化仓库
git init

# 3. 添加所有文件
git add .

# 4. 创建新的初始提交
git commit -m "Initial commit: Clean version without sensitive data"

# 5. 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/YOUR_NEW_REPO.git

# 6. 推送到新仓库
git push -u origin main
```

---

## ✅ 清理后的验证步骤

### 1. 检查历史中是否还有敏感信息
```bash
# 搜索是否还有敏感信息
git log --all -p | grep "sk-"
git log --all -p | grep "fsonawgyuqwnshhcsszq"

# 或使用 git-secrets 工具
git secrets --scan-history
```

### 2. 在新环境中克隆并测试
```bash
# 克隆仓库到新目录
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git test-clone

# 检查是否有敏感文件
ls -la test-clone
cat test-clone/.env  # 应该提示文件不存在
```

---

## 📋 开源前的最终检查清单

- [ ] 已撤销/重新生成所有泄露的 API 密钥
- [ ] 已清理 Git 历史中的敏感信息
- [ ] 已更新 `.gitignore` 包含所有敏感文件
- [ ] 已创建 `.env.example` 供用户参考
- [ ] 已删除所有包含真实密钥的文档
- [ ] 在新环境中克隆并验证无敏感信息
- [ ] 检查是否有遗漏的敏感文件或目录
- [ ] 确认 `.env` 等文件不会被意外提交

---

## 🔐 防止未来泄露的措施

### 1. 安装 pre-commit hook
```bash
# 安装 git-secrets
brew install git-secrets  # macOS

# 在仓库中设置
git secrets --install
git secrets --register-aws
git secrets --add 'sk-[a-zA-Z0-9]{20,}'
git secrets --add 'eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+'
```

### 2. 使用环境变量管理工具
- 永远不要将 `.env` 文件提交到 Git
- 使用 `.env.example` 作为模板
- 在 CI/CD 中使用加密的 secrets

### 3. 定期审计
```bash
# 定期扫描仓库
trufflehog git https://github.com/YOUR_USERNAME/YOUR_REPO.git
gitleaks detect --source .
```

---

## 📞 需要帮助？

如果遇到问题：
1. 确保已备份代码
2. 在测试分支上先尝试清理
3. 使用 `--dry-run` 参数预览更改（BFG 支持）

---

**⚠️ 重要提醒：即使清理了 Git 历史，已泄露的密钥也必须立即撤销！**
