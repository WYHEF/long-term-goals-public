# 🔴 学校 DeepSeek API 服务问题报告

## 问题描述

学校的 DeepSeek API 服务器（`http://117.145.189.131:48081`）返回 **502 Bad Gateway** 错误。

## 测试时间
2025-10-31 12:20

## 测试结果

### 1. 端口连接测试
```powershell
Test-NetConnection -ComputerName 117.145.189.131 -Port 48081
```
**结果**：✅ 成功（`TcpTestSucceeded: True`）
- 说明：服务器端口是开放的，网络连接正常

### 2. API 调用测试
```powershell
Invoke-WebRequest -Uri "http://117.145.189.131:48081/api/generate" `
  -Method POST `
  -Headers @{"X-API-Key" = "mjmnb"; "Content-Type" = "application/json"} `
  -Body '{"model": "deepseek-r1:70b", "prompt": "你好", "stream": false}'
```
**结果**：❌ 失败
```
远程服务器返回错误: (502) 错误的网关
```

## 问题分析

### 502 Bad Gateway 的含义
- ✅ Nginx/反向代理服务器正常运行
- ❌ 后端的 DeepSeek/Ollama 服务**没有正常响应**

### 可能的原因
1. **DeepSeek/Ollama 服务未启动**
2. **服务崩溃或重启中**
3. **服务器负载过高**
4. **配置错误**
5. **正在维护**

## 使用的配置

### API 信息
- **API URL**: `http://117.145.189.131:48081/api/generate`
- **API Key**: `mjmnb`
- **Model**: `deepseek-r1:70b`
- **接口规范**: Ollama API

### 请求格式（正确）
```json
{
  "model": "deepseek-r1:70b",
  "prompt": "你好",
  "stream": false
}
```

### 请求头（正确）
```
X-API-Key: mjmnb
Content-Type: application/json
```

## 我们已经做的工作

1. ✅ 确认了 API 使用 Ollama 格式（而非 OpenAI 格式）
2. ✅ 修改了请求格式（`prompt` 而非 `messages`）
3. ✅ 修改了认证方式（`X-API-Key` 而非 `Authorization`）
4. ✅ 配置了 Vite 代理解决 CORS 问题
5. ✅ 测试了端口连接（成功）
6. ✅ 直接测试了 API（返回 502）

## 结论

**这是服务器端的问题，不是我们代码的问题。**

需要学校管理员：
1. 检查 DeepSeek/Ollama 服务是否运行
2. 查看服务器日志
3. 重启后端服务
4. 确认服务配置

## 建议的临时方案

在学校 API 服务恢复之前，可以：

### 方案1：使用"跳过AI分析"功能
- 创建目标时点击"跳过AI分析"按钮
- 所有其他功能完全可用
- 等待 API 修复后再启用 AI 功能

### 方案2：使用官方 DeepSeek API
如果需要 AI 功能且学校 API 长期无法使用：
1. 访问 https://platform.deepseek.com/
2. 注册并获取官方 API Key
3. 修改 `.env` 配置：
```env
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
VITE_DEEPSEEK_API_KEY=你的官方API_Key
```
4. 同时需要修改 `src/config/deepseek.js` 改回 OpenAI 格式

---

**报告生成时间**：2025-10-31 12:22  
**状态**：⏳ 等待学校管理员处理

