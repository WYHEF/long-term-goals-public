// 检查用户的目标和任务数据
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// 加载环境变量
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少环境变量！')
  console.error('请确保 .env 文件中配置了:')
  console.error('  - VITE_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTasks() {
  console.log('🔍 检查用户目标和任务数据...\n')

  // 获取所有进行中的目标
  const { data: goals, error } = await supabase
    .from('goals')
    .select('id, title, type, status, plan, user_id')
    .eq('status', '进行中')

  if (error) {
    console.error('❌ 查询失败:', error)
    return
  }

  if (!goals || goals.length === 0) {
    console.log('⚠️ 没有找到进行中的目标')
    return
  }

  console.log(`✅ 找到 ${goals.length} 个进行中的目标\n`)

  goals.forEach((goal, index) => {
    console.log(`\n目标 ${index + 1}:`)
    console.log(`  标题: ${goal.title}`)
    console.log(`  类型: ${goal.type}`)
    console.log(`  状态: ${goal.status}`)
    
    if (goal.plan && goal.plan.dailyTasks) {
      console.log(`  每日任务数量: ${goal.plan.dailyTasks.length}`)
      goal.plan.dailyTasks.forEach((task, i) => {
        const taskText = task.task || task
        console.log(`    ${i + 1}. ${taskText}`)
      })
    } else {
      console.log(`  ⚠️ 没有设置每日任务`)
    }
  })

  console.log('\n' + '='.repeat(50))
  console.log('💡 如果目标没有每日任务，邮件中将不会显示任务列表')
  console.log('💡 请在网站上编辑目标，添加每日任务')
}

checkTasks()
