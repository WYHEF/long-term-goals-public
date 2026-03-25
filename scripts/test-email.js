// 测试邮件提醒功能
const CRON_SECRET = 'your-cron-secret-here'
const API_URL = 'https://your-domain.com/api/cron/send-reminders'

console.log('🧪 开始测试邮件提醒功能...\n')

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CRON_SECRET}`,
    'Content-Type': 'application/json'
  }
})
  .then(async res => {
    const data = await res.json()
    
    console.log('📊 HTTP 状态码:', res.status)
    console.log('📧 响应数据:', JSON.stringify(data, null, 2))
    
    if (res.status === 200) {
      console.log('\n✅ 测试成功！')
      console.log(`📋 今天截止的目标数: ${data.totalGoals || 0}`)
      console.log(`👥 涉及的用户数: ${data.totalUsers || 0}`)
      console.log(`✉️ 成功发送: ${data.successCount || 0}`)
      console.log(`❌ 发送失败: ${data.failCount || 0}`)
    } else {
      console.log('\n❌ 测试失败！')
      console.log('错误信息:', data.error)
    }
  })
  .catch(err => {
    console.error('\n❌ 请求失败:', err.message)
    console.error('可能的原因:')
    console.error('1. Vercel 还在部署中（等待几分钟）')
    console.error('2. 环境变量配置错误')
    console.error('3. API 路由未正确部署')
  })
