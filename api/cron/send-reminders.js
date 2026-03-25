import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY // 使用 Service Key 绕过 RLS
const resendApiKey = process.env.RESEND_API_KEY

// 创建 Supabase 客户端（使用 Service Key）
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * 发送截止提醒邮件的 Vercel Serverless Function
 * 每天 9:00 和 21:00 自动触发
 */
export default async function handler(req, res) {
  // 验证请求来源（防止被恶意调用）
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    console.log('⏰ 开始执行邮件提醒任务...')

    // 获取今天的日期（开始和结束时间）
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
    
    // 查询今天截止的倒数日
    const { data: countdowns, error: countdownsError } = await supabase
      .from('countdowns')
      .select('id, title, description, target_date, category, user_id')
      .gte('target_date', todayStart.toISOString())
      .lte('target_date', todayEnd.toISOString())
      .eq('is_completed', false)

    if (countdownsError) {
      console.error('❌ 查询倒数日失败:', countdownsError)
      return res.status(500).json({ error: 'Database query failed', details: countdownsError })
    }

    if (!countdowns || countdowns.length === 0) {
      console.log('✅ 今天没有截止的倒数日')
      return res.status(200).json({ message: '今天没有截止的倒数日', count: 0 })
    }

    console.log(`📋 找到 ${countdowns.length} 个今天截止的倒数日`)

    // 按用户分组倒数日
    const userCountdownsMap = {}
    countdowns.forEach(countdown => {
      if (!userCountdownsMap[countdown.user_id]) {
        userCountdownsMap[countdown.user_id] = []
      }
      userCountdownsMap[countdown.user_id].push(countdown)
    })

    // 获取所有用户今天的任务
    const userIds = Object.keys(userCountdownsMap)
    const userTasksMap = {}
    
    for (const userId of userIds) {
      // 查询用户进行中的目标
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('id, title, type, plan')
        .eq('user_id', userId)
        .eq('status', '进行中')

      if (!goalsError && goals && goals.length > 0) {
        const dailyTasks = []
        goals.forEach(goal => {
          if (goal.plan && goal.plan.dailyTasks && Array.isArray(goal.plan.dailyTasks)) {
            goal.plan.dailyTasks.forEach(task => {
              dailyTasks.push({
                goalTitle: goal.title,
                task: task.task || task
              })
            })
          }
        })
        userTasksMap[userId] = dailyTasks
      } else {
        userTasksMap[userId] = []
      }
    }

    // 获取所有相关用户的邮箱
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      console.error('❌ 查询用户失败:', usersError)
      return res.status(500).json({ error: 'Failed to fetch users', details: usersError })
    }

    // 创建用户 ID 到邮箱的映射
    const userEmailMap = {}
    users.users.forEach(user => {
      if (userIds.includes(user.id)) {
        userEmailMap[user.id] = user.email
      }
    })

    // 发送邮件
    let successCount = 0
    let failCount = 0

    for (const userId of userIds) {
      const userEmail = userEmailMap[userId]
      if (!userEmail) {
        console.warn(`⚠️ 用户 ${userId} 没有邮箱`)
        failCount++
        continue
      }

      const userCountdowns = userCountdownsMap[userId]
      const userTasks = userTasksMap[userId] || []
      
      try {
        await sendReminderEmail(userEmail, userCountdowns, userTasks)
        successCount++
        console.log(`✅ 已发送邮件给 ${userEmail}`)
      } catch (error) {
        console.error(`❌ 发送邮件失败 (${userEmail}):`, error)
        failCount++
      }
    }

    console.log(`📊 邮件发送完成: 成功 ${successCount}, 失败 ${failCount}`)

    return res.status(200).json({
      message: '邮件提醒任务完成',
      totalCountdowns: countdowns.length,
      totalUsers: userIds.length,
      successCount,
      failCount
    })

  } catch (error) {
    console.error('❌ 执行任务时发生错误:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

/**
 * 发送提醒邮件
 */
async function sendReminderEmail(email, countdowns, tasks) {
  const emailHtml = generateEmailHtml(countdowns, tasks)
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: '星煜凡程 <onboarding@resend.dev>', // 测试域名，后续可改为自定义域名
      to: email,
      subject: '⏰ 倒数日提醒 - 今天是重要的日子！',
      html: emailHtml
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Resend API error: ${JSON.stringify(error)}`)
  }

  return await response.json()
}

/**
 * 生成邮件 HTML 内容
 */
function generateEmailHtml(countdowns, tasks) {
  // 使用北京时间（UTC+8）
  const now = new Date()
  const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)) // 转换为北京时间
  const currentHour = beijingTime.getUTCHours()
  const timeOfDay = currentHour < 12 ? '早上' : '晚上'
  
  // 计算距离北京时间今天结束的时间
  const endOfDay = new Date(beijingTime)
  endOfDay.setUTCHours(23, 59, 59, 999)
  const hoursLeft = Math.max(1, Math.ceil((endOfDay - beijingTime) / (1000 * 60 * 60)))

  // 倒数日图标映射（使用文字代替emoji）
  const categoryIcons = {
    exam: '✏️',
    birthday: '🎂',
    anniversary: '💝',
    deadline: '⏰',
    other: '📌'
  }
  
  const categoryNames = {
    exam: '[考试]',
    birthday: '[生日]',
    anniversary: '[纪念日]',
    deadline: '[截止日期]',
    other: '[重要日期]'
  }

  // 生成倒数日列表HTML
  const countdownsHtml = countdowns.map(countdown => {
    const categoryName = categoryNames[countdown.category] || '[重要日期]'
    const description = countdown.description ? `<p style="margin: 8px 0; color: #6b7280; font-size: 14px;">${countdown.description}</p>` : ''
    
    return `
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 18px;">
          <span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px;">${categoryName}</span>
          ${countdown.title}
        </h3>
        ${description}
        <p style="margin: 8px 0 0 0; color: #b45309; font-size: 14px; font-weight: 600;">
          ★ 今天就是这个重要的日子！
        </p>
      </div>
    `
  }).join('')

  // 生成今日任务列表HTML
  let tasksHtml = ''
  if (tasks && tasks.length > 0) {
    const tasksListHtml = tasks.map(task => 
      `<li style="margin: 8px 0; color: #4b5563;">
        <strong style="color: #1f2937;">${task.goalTitle}:</strong> ${task.task}
      </li>`
    ).join('')

    tasksHtml = `
      <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 12px 0; color: #1e3a8a; font-size: 18px;">
          <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px;">[今日任务]</span>
          需要完成的任务
        </h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${tasksListHtml}
        </ul>
      </div>
    `
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>倒数日提醒</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- 头部 -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px;">
            【倒数日提醒】
          </h1>
          <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
            ${timeOfDay}好！今天是重要的日子
          </p>
        </div>

        <!-- 主体内容 -->
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- 倒计时提醒 -->
          <div style="background: #fef3c7; border: 2px solid #fbbf24; padding: 16px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
            <p style="margin: 0; color: #92400e; font-size: 18px; font-weight: 600;">
              距离今天结束还有约 ${hoursLeft} 小时
            </p>
            <p style="margin: 8px 0 0 0; color: #b45309; font-size: 14px;">
              珍惜这个特别的日子！
            </p>
          </div>

          <!-- 倒数日列表 -->
          <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
            ★ 今天到期的倒数日 (${countdowns.length}个)
          </h2>
          ${countdownsHtml}

          <!-- 今日任务 -->
          ${tasksHtml}

          <!-- 鼓励语 -->
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-top: 24px; text-align: center;">
            <p style="margin: 0; color: #1e40af; font-size: 16px; font-weight: 600;">
              今天是特别的一天，加油！
            </p>
          </div>

          <!-- 按钮 -->
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://goals.wyhef.cloud" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              查看详情 &rarr;
            </a>
          </div>
        </div>

        <!-- 页脚 -->
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">星煜凡程 - 凡程蓄力，星途煜辉</p>
          <p style="margin: 8px 0 0 0;">
            <a href="https://goals.wyhef.cloud" style="color: #6b7280; text-decoration: none;">访问网站</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
