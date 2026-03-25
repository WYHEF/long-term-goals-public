import axios from 'axios'
import { supabase } from './supabase'

const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY

/**
 * 检查AI功能是否启用
 */
async function checkAIEnabled() {
  try {
    const { data, error } = await supabase
      .from('system_configs')
      .select('value')
      .eq('key', 'deepseek_api_enabled')
      .single()
    
    if (error) {
      console.warn('无法获取AI配置，默认启用')
      return true
    }
    
    return data?.value === 'true' || data?.value === true
  } catch (error) {
    console.warn('检查AI配置失败，默认启用')
    return true
  }
}

/**
 * 调用DeepSeek API (官方OpenAI格式)
 * @param {string} prompt - 提示词
 * @param {object} options - 可选配置
 */
export async function callDeepSeek(prompt, options = {}) {
  try {
    // 检查AI功能是否启用
    const aiEnabled = await checkAIEnabled()
    if (!aiEnabled) {
      console.log('⚠️ AI功能已被管理员禁用')
      return {
        success: false,
        error: 'AI功能已被管理员禁用，请联系管理员或使用基础模板'
      }
    }
    
    console.log('🤖 调用阿里云百炼 API...')
    console.log('API URL:', DEEPSEEK_API_URL)
    console.log('API Key 前缀:', DEEPSEEK_API_KEY?.substring(0, 10) + '...')
    
    // 使用阿里云百炼 API (OpenAI 兼容格式)
    const requestData = {
      model: 'qwen3.5-plus',  // 阿里云百炼模型
      messages: [
        {
          role: 'system',
          content: '你是一个专业的目标规划助手，擅长帮助用户制定科学、可执行的学习和健康计划。你的建议要详细、实用、符合实际情况。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 4000,
      ...options
    }
    
    console.log('请求数据:', JSON.stringify(requestData, null, 2))
    
    const response = await axios.post(DEEPSEEK_API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`  // OpenAI 标准格式
      },
      timeout: 60000 // 60秒超时
    })
    
    console.log('✅ API 调用成功')
    console.log('响应数据:', response.data)
    
    // OpenAI API 返回格式
    return {
      success: true,
      data: response.data.choices[0].message.content,
      raw: response.data
    }
  } catch (error) {
    console.error('❌ 阿里云百炼 API调用失败')
    console.error('错误详情:', error)
    console.error('错误响应:', error.response?.data)
    console.error('错误状态码:', error.response?.status)
    console.error('错误消息:', error.message)
    
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    }
  }
}

/**
 * 调用DeepSeek API (流式响应)
 * @param {string} prompt - 提示词
 * @param {function} onChunk - 接收每个数据块的回调函数
 * @param {object} options - 可选配置
 */
export async function callDeepSeekStream(prompt, onChunk, options = {}) {
  try {
    // 检查AI功能是否启用
    const aiEnabled = await checkAIEnabled()
    if (!aiEnabled) {
      console.log('⚠️ AI功能已被管理员禁用')
      return {
        success: false,
        error: 'AI功能已被管理员禁用，请联系管理员或使用基础模板'
      }
    }
    
    console.log('🤖 调用阿里云百炼 API (流式)...')
    
    const requestData = {
      model: 'qwen3.5-plus',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的目标规划助手，擅长帮助用户制定科学、可执行的学习和健康计划。你的建议要详细、实用、符合实际情况。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 4000,
      stream: true, // 启用流式响应
      ...options
    }
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let fullContent = ''
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        break
      }
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留最后一个不完整的行
      
      for (const line of lines) {
        if (line.trim() === '' || line.trim() === 'data: [DONE]') {
          continue
        }
        
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6) // 移除 'data: ' 前缀
            const data = JSON.parse(jsonStr)
            const delta = data.choices[0]?.delta
            
            // 阿里云百炼支持 reasoning_content (思考过程)
            // 我们只返回最终的 content，不返回思考过程
            const content = delta?.content
            
            if (content) {
              fullContent += content
              // 调用回调函数，传递增量内容和完整内容
              if (onChunk) {
                onChunk(content, fullContent)
              }
            }
          } catch (e) {
            console.error('解析SSE数据失败:', e, line)
          }
        }
      }
    }
    
    console.log('✅ 阿里云百炼流式API调用完成')
    
    return {
      success: true,
      data: fullContent
    }
  } catch (error) {
    console.error('❌ 阿里云百炼流式API调用失败:', error)
    
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 智能识别倒数日信息
 * @param {string} description - 用户粘贴的文字描述
 */
export async function parseCountdownInfo(description) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  const prompt = `
你是一个智能日程助手，需要从用户提供的文字中提取关键信息。

用户输入的文字：
"""
${description}
"""

当前日期：${todayStr}

请分析并提取以下信息：
1. **事件标题**：总结出简短的标题（10字以内）
2. **截止日期**：提取日期和时间
   - 如果文字中提到"12月18日晚20:00"，应识别为 2025-12-18 20:00
   - 如果只提到日期没提时间，默认时间为 00:00
   - 如果没有年份，使用当前年份或下一年（根据月份判断）
3. **事件分类**：判断属于哪个类别
   - exam: 考试相关（包括：考试、测试、考核、答辩等）
   - birthday: 生日相关
   - anniversary: 纪念日、周年相关
   - deadline: 截止日期（包括：提交、上交、报名截止、申请截止等）
   - other: 其他（会议、活动、聚会等）

请以JSON格式输出（不要添加任何markdown格式）：
{
  "title": "简短标题",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "category": "exam|birthday|anniversary|deadline|other",
  "confidence": "high|medium|low"
}

注意：
- 如果无法确定某个字段，使用合理的默认值
- confidence表示识别的置信度
- 时间必须是24小时制
`
  
  try {
    const result = await callDeepSeek(prompt, {
      temperature: 0.3, // 降低temperature以获得更准确的结果
      max_tokens: 500
    })
    
    if (result.success) {
      try {
        // 尝试解析JSON
        const jsonMatch = result.data.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0])
          
          // 验证数据格式
          if (parsedData.title && parsedData.date) {
            return {
              success: true,
              data: {
                title: parsedData.title,
                date: parsedData.date,
                time: parsedData.time || '00:00',
                category: parsedData.category || 'other',
                confidence: parsedData.confidence || 'medium'
              }
            }
          }
        }
      } catch (e) {
        console.error('JSON解析失败:', e)
      }
    }
    
    // 如果解析失败，返回错误
    return {
      success: false,
      error: '无法识别文字中的关键信息，请检查输入内容'
    }
  } catch (error) {
    console.error('AI识别失败:', error)
    return {
      success: false,
      error: error.message || 'AI识别失败'
    }
  }
}

/**
 * 第一步：分析目标并给出建议
 * @param {string} goalTitle - 目标标题
 * @param {string} goalType - 目标类型（学习类/健康类）
 */
export async function analyzeGoal(goalTitle, goalType) {
  const prompt = `
用户想要达成的目标是：${goalTitle}
目标类型：${goalType}

请详细分析这个目标，并给出以下建议：
1. 目标分析：这个目标通常需要什么准备？涉及哪些方面？
2. 时间建议：建议的准备周期是多久？
3. 每日投入：建议每天投入多少时间？
4. 注意事项：有什么需要特别注意的地方？
5. 资源推荐：有什么好的学习资源或方法推荐？

请给出详细、实用的建议，帮助用户充分了解这个目标。
输出格式为JSON：
{
  "analysis": "目标分析内容",
  "suggestedDuration": "建议周期（如：3-6个月）",
  "dailyTimeInvestment": "每日投入时间（如：1-2小时）",
  "keyPoints": ["注意事项1", "注意事项2"],
  "resources": ["推荐资源1", "推荐资源2"]
}
`
  
  const result = await callDeepSeek(prompt)
  
  if (result.success) {
    try {
      // 尝试解析JSON
      const jsonMatch = result.data.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return {
          success: true,
          data: JSON.parse(jsonMatch[0])
        }
      }
    } catch (e) {
      console.error('JSON解析失败，返回原始内容')
    }
    
    // 如果JSON解析失败，返回原始内容
    return {
      success: true,
      data: {
        analysis: result.data,
        suggestedDuration: '根据实际情况而定',
        dailyTimeInvestment: '1-2小时',
        keyPoints: [],
        resources: []
      }
    }
  }
  
  return result
}

/**
 * 验证并修正计划周期和参数匹配
 * @param {object} plan - AI生成的计划
 * @param {object} params - 用户参数
 * @param {number} maxWeeks - 最大周数
 * @param {number} maxDays - 最大天数
 */
function validateAndFixPlan(plan, params, maxWeeks, maxDays) {
  const { goalNature, strictLevel, dailyTime, weakPoints } = params
  
  // 校验执行严格度
  if (strictLevel === '严格') {
    // 检查是否有"必须完成"标记
    const hasStrictMark = JSON.stringify(plan).includes('必须完成')
    if (!hasStrictMark) {
      console.warn('⚠️ 严格度匹配失败：未找到"必须完成"标记')
    }
  } else if (strictLevel === '弹性') {
    // 检查是否有"可选"标记
    const hasFlexibleMark = JSON.stringify(plan).includes('可选')
    if (!hasFlexibleMark) {
      console.warn('⚠️ 严格度匹配失败：未找到"可选"标记')
    }
  }
  
  // 校验目标性质
  if (goalNature === 'continuous') {
    // 长期习惯：检查是否有复盘日
    const hasReviewWeek = plan.weeklyTasks?.some(w => w.isReviewWeek)
    if (!hasReviewWeek) {
      console.warn('⚠️ 长期习惯计划缺少复盘日')
    }
  } else if (goalNature === 'staged') {
    // 阶段目标：检查是否有进度检查点
    const hasCheckPoint = plan.weeklyTasks?.some(w => w.checkPoint)
    if (!hasCheckPoint) {
      console.warn('⚠️ 阶段目标计划缺少进度检查点')
    }
  }
  
  // 转换 dailyTasks 到 weeklyTasks.dailyTasks 格式（兼容现有UI）
  // 这是核心数据，优先使用AI生成的dailyTasks
  if (plan.dailyTasks && Array.isArray(plan.dailyTasks) && plan.dailyTasks.length > 0) {
    console.log('📋 开始转换 dailyTasks，共', plan.dailyTasks.length, '天')
    
    // 按周分组
    const weekGroups = {}
    plan.dailyTasks.forEach(dayTask => {
      const week = Math.ceil(dayTask.day / 7)
      if (!weekGroups[week]) {
        weekGroups[week] = {
          week,
          focus: plan.weeklyTasks?.find(w => w.week === week)?.focus || `第${week}周重点`,
          dailyTasks: [],
          isReviewWeek: week % 4 === 0 && goalNature === 'continuous',
          checkPoint: week % 4 === 0 && goalNature === 'staged' ? '进度检查点' : null
        }
      }
      
      // 提取任务内容
      const taskContents = []
      if (dayTask.tasks && Array.isArray(dayTask.tasks)) {
        dayTask.tasks.forEach(t => {
          if (typeof t === 'string') {
            taskContents.push(t)
          } else if (t.content) {
            // 格式化为更友好的显示：时间 + 内容
            const formatted = t.time ? `${t.time} ${t.content}` : t.content
            taskContents.push(formatted)
          }
        })
      }
      
      // 如果没有提取到任务，使用默认内容
      if (taskContents.length === 0) {
        taskContents.push('完成每日学习任务')
      }
      
      console.log(`  Day ${dayTask.day}: 提取到 ${taskContents.length} 个任务`)
      
      weekGroups[week].dailyTasks.push({
        day: ((dayTask.day - 1) % 7) + 1,
        dayName: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][((dayTask.day - 1) % 7)],
        tasks: taskContents,
        estimatedTime: dayTask.totalTime || dailyTime,
        emphasis: dayTask.emphasis || ''
      })
    })
    
    // 转换为数组并按周排序
    const sortedWeekGroups = Object.values(weekGroups).sort((a, b) => a.week - b.week)
    console.log('📋 转换完成，共', sortedWeekGroups.length, '周')
    
    // 直接使用转换后的数据，不再与原有的weeklyTasks合并（避免覆盖问题）
    plan.weeklyTasks = sortedWeekGroups
  }
  
  // 修正 stages（支持新的 startDay/endDay 格式）
  if (plan.stages && Array.isArray(plan.stages)) {
    plan.stages = plan.stages
      .filter(stage => {
        const start = stage.startDay || (stage.startWeek ? stage.startWeek * 7 : 1)
        return start <= maxDays
      })
      .map(stage => ({
        ...stage,
        startWeek: stage.startWeek || Math.ceil((stage.startDay || 1) / 7),
        endWeek: Math.min(stage.endWeek || Math.ceil((stage.endDay || maxDays) / 7), maxWeeks)
      }))
  }
  
  // 确保 weeklyTasks 存在且格式正确
  if (plan.weeklyTasks && Array.isArray(plan.weeklyTasks)) {
    plan.weeklyTasks = plan.weeklyTasks
      .filter(task => task.week <= maxWeeks)
      .map(task => {
        // 如果已有dailyTasks且不为空，保留它们
        if (task.dailyTasks && task.dailyTasks.length > 0) {
          return {
            ...task,
            week: Math.min(task.week, maxWeeks),
            dailyTasks: task.dailyTasks.slice(0, 7) // 确保最多7天
          }
        }
        
        // 如果没有dailyTasks，只在前3周生成默认任务
        if (task.week <= 3) {
          return {
            ...task,
            week: Math.min(task.week, maxWeeks),
            dailyTasks: generateDefaultDailyTasks(task.week, strictLevel, weakPoints, dailyTime)
          }
        }
        
        // 第4周及以后，如果没有dailyTasks就保留原样
        return {
          ...task,
          week: Math.min(task.week, maxWeeks)
        }
      })
  }
  
  // 如果修正后没有周任务，生成基础任务
  if (!plan.weeklyTasks || plan.weeklyTasks.length === 0) {
    plan.weeklyTasks = Array.from({ length: Math.min(maxWeeks, 4) }, (_, i) => ({
      week: i + 1,
      focus: `第${i + 1}周重点`,
      isReviewWeek: (i + 1) % 4 === 0 && goalNature === 'continuous',
      checkPoint: (i + 1) % 4 === 0 && goalNature === 'staged' ? '进度检查点' : null,
      dailyTasks: generateDefaultDailyTasks(i + 1, strictLevel, weakPoints, dailyTime)
    }))
  }
  
  // 添加 meta 信息
  plan.meta = plan.meta || {
    goalNature,
    strictLevel,
    totalDays: maxDays,
    dailyTime,
    note: goalNature === 'continuous' ? '长期坚持，无固定结束时间' : `计划结束于第${maxWeeks}周`
  }
  
  return plan
}

/**
 * 生成默认的每日任务
 * @param {number} weekNumber - 周数
 * @param {string} strictLevel - 执行严格度
 * @param {string} weakPoints - 薄弱环节
 * @param {number} dailyTime - 每日时间
 */
function generateDefaultDailyTasks(weekNumber, strictLevel = '标准', weakPoints = '', dailyTime = 60) {
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const isReviewDay = weekNumber > 0 && (weekNumber * 7 - 6) % 28 === 0 // 每4周第一天为复盘周
  
  // 根据严格度生成任务前缀
  const taskPrefix = {
    '严格': '今日必须完成：',
    '标准': '今日任务：',
    '弹性': '今日可选：'
  }[strictLevel] || '今日任务：'
  
  return dayNames.map((dayName, index) => {
    const dayOfWeek = (weekNumber - 1) * 7 + index + 1
    const isSunday = index === 6
    
    let tasks = []
    let emphasis = '按计划完成'
    
    if (isSunday && isReviewDay) {
      tasks = ['周复盘：回顾本周进度', '调整下周计划']
      emphasis = '复盘调整'
    } else if (isSunday) {
      tasks = ['复习本周内容', '适当休息']
      emphasis = '复习休息'
    } else {
      tasks = [taskPrefix + '完成本日学习任务', '保持每日打卡']
      if (weakPoints && weakPoints !== '未提供') {
        tasks.push(`强化练习：${weakPoints}`)
        emphasis = `含${weakPoints}强化`
      }
    }
    
    return {
      day: index + 1,
      dayName: dayName,
      tasks,
      estimatedTime: dailyTime,
      emphasis
    }
  })
}

/**
 * 第二步：根据用户回答生成详细计划（流式版本）
 * @param {string} goalTitle - 目标标题
 * @param {string} goalType - 目标类型
 * @param {object} userAnswers - 用户的回答
 * @param {function} onChunk - 接收流式数据的回调函数
 */
export async function generatePlanStream(goalTitle, goalType, userAnswers, onChunk) {
  // 计算可用的天数
  let totalDays = 90 // 默认90天
  let totalWeeks = 12 // 默认12周
  
  // 统一获取截止日期 (examDate 为学习类，targetDate 为健康类)
  const endDateStr = userAnswers.examDate || userAnswers.targetDate
  const goalNature = userAnswers.goalNature || 'staged' // 目标性质：continuous=长期习惯, staged=阶段目标
  const currentLevel = userAnswers.currentLevel || '未提供' // 当前基础
  const weakPoints = userAnswers.weakPoints || '未提供' // 薄弱环节
  const dailyTime = userAnswers.dailyTime || 60 // 每日投入时间（分钟）
  const strictLevel = userAnswers.strict_level || '标准' // 执行严格度：严格/标准/弹性
  
  if (endDateStr) {
    const endDate = new Date(endDateStr)
    const today = new Date()
    const diffTime = endDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    totalDays = Math.max(1, diffDays)
    totalWeeks = Math.max(1, Math.ceil(diffDays / 7))
  }
  
  // 根据目标性质决定生成策略
  const isLongTermHabit = goalNature === 'continuous'
  const isStagedGoal = goalNature === 'staged'
  
  // 根据执行严格度决定任务描述方式
  const strictnessInstruction = {
    '严格': '每个每日任务必须标注【今日必须完成】，任务不可调整',
    '标准': '每个每日任务标注【今日任务】，允许小幅调整',
    '弹性': '每个每日任务标注【今日可选】，提供多个选项供用户选择'
  }[strictLevel] || '每个每日任务标注【今日任务】'
  
  // 根据当前基础决定难度
  let difficultyInstruction = ''
  if (currentLevel && currentLevel !== '未提供') {
    if (currentLevel.includes('零基础') || currentLevel.includes('薄弱') || currentLevel.includes('差')) {
      difficultyInstruction = `用户基础较弱，前2周应以基础巩固为主，任务难度要低，每日任务量不超过${Math.floor(dailyTime * 0.8)}分钟的工作量`
    } else if (currentLevel.includes('良好') || currentLevel.includes('扎实') || currentLevel.includes('强')) {
      difficultyInstruction = `用户基础较好，可直接进入进阶内容，适当提高任务难度`
    } else {
      difficultyInstruction = `根据用户描述"${currentLevel}"合理安排任务难度`
    }
  }
  
  // 根据薄弱环节安排强化任务
  let weakPointsInstruction = ''
  if (weakPoints && weakPoints !== '未提供') {
    weakPointsInstruction = `用户薄弱环节为"${weakPoints}"，每日计划中必须包含至少1项针对该薄弱环节的强化任务`
  }
  
  const prompt = `
你是一个专业的目标规划助手，需要根据用户信息生成详细的执行计划。

## 用户信息
- **目标标题**：${goalTitle}
- **目标类型**：${goalType}
- **目标性质**：${isLongTermHabit ? '长期习惯（无固定结束时间）' : '阶段目标（有明确结束时间）'}
- **当前基础**：${currentLevel}
- **薄弱环节**：${weakPoints}
- **每日投入时间**：${dailyTime}分钟
- **执行严格度**：${strictLevel}
${endDateStr ? `- **截止日期**：${endDateStr}` : ''}

## 核心约束（必须100%遵守）

### 1. 目标性质匹配
${isLongTermHabit ? `
- 这是"长期习惯"目标，无固定结束时间
- 计划强调"小习惯积累"，每日任务数量≤2个
- 每周设置一个"复盘日"（周日），用于回顾和调整
- 计划末尾标注："长期坚持，无固定结束时间"
- 不要设置具体结束日期
` : `
- 这是"阶段目标"，有明确结束时间
- 截止日期：${endDateStr}，总共约${totalDays}天（${totalWeeks}周）
- 按里程碑拆解，每月设置"进度检查点"
- 最后1周设为"冲刺周"，增加任务强度
- 计划末尾标注："计划结束于：${endDateStr}"
- 所有阶段和任务必须在${totalWeeks}周内完成
`}

### 2. 执行严格度匹配
- ${strictnessInstruction}
- ${strictLevel === '严格' ? '每个任务描述中必须包含"今日必须完成：A+B"格式' : ''}
- ${strictLevel === '弹性' ? '每个任务描述中必须包含"今日可选：A或B"格式，提供灵活选项' : ''}

### 3. 当前基础适配
${difficultyInstruction}

### 4. 薄弱环节强化
${weakPointsInstruction}

## 用户已有计划/备注
"${userAnswers.customPlan || '用户未提供'}"

## 输出要求

### 计划结构
按"天"拆解（Day1、Day2...），每日内容简明（50-80字），包含：
- 具体任务描述
- 预计时间（如"15:00-15:30"）

### 分阶段生成策略
${totalDays > 30 ? `
由于总天数超过30天，采用以下策略：
- 前30天：生成详细每日计划
- 后续阶段：生成月度概要（标注主要目标）
` : `
为全部${totalDays}天生成详细计划
`}

### 输出格式（JSON）
请以标准JSON格式输出，不要使用Markdown代码块：

{
  "meta": {
    "goalNature": "${goalNature}",
    "strictLevel": "${strictLevel}",
    "totalDays": ${totalDays},
    "dailyTime": ${dailyTime},
    "endDate": ${endDateStr ? `"${endDateStr}"` : 'null'},
    "note": ${isLongTermHabit ? '"长期坚持，无固定结束时间"' : `"计划结束于：${endDateStr}"`}
  },
  "stages": [
    {
      "name": "阶段名称",
      "startDay": 1,
      "endDay": ${Math.min(15, totalDays)},
      "description": "阶段描述",
      "goals": ["目标1", "目标2"]
    }
  ],
  "dailyTasks": [
    {
      "day": 1,
      "date": "${new Date().toISOString().split('T')[0]}",
      "tasks": [
        {
          "time": "15:00-15:30",
          "content": "任务内容（${strictLevel === '严格' ? '今日必须完成' : strictLevel === '弹性' ? '今日可选' : '今日任务'}）",
          "duration": 30,
          "category": "学习/练习/复习"
        }
      ],
      "totalTime": ${dailyTime},
      "emphasis": "${weakPoints !== '未提供' ? '包含' + weakPoints + '强化练习' : '按计划执行'}"
    }
  ],
  "weeklyTasks": [
    {
      "week": 1,
      "focus": "本周重点",
      "checkPoint": ${isStagedGoal ? '"进度检查点"' : 'null'},
      "isReviewWeek": false
    }
  ]
}

## 重要提醒
1. 每日任务总时间不要超过${dailyTime}分钟
2. 任务描述要具体、可量化、可执行
3. 必须根据目标性质、执行严格度、当前基础、薄弱环节定制计划
4. JSON必须完整闭合，不要添加注释
`
  
  const result = await callDeepSeekStream(prompt, onChunk)
  
  if (result.success) {
    console.log('🔍 开始解析AI返回内容...')
    console.log('原始内容长度:', result.data.length)
    
    try {
      let planData = null
      let rawContent = result.data
      
      // ===== 策略0：直接尝试解析（如果AI返回的是纯JSON） =====
      try {
        planData = JSON.parse(rawContent)
        console.log('✅ 直接解析成功')
      } catch (e) {
        console.log('直接解析失败，尝试其他策略...')
      }
      
      // ===== 策略1：从 Markdown 代码块中提取 =====
      if (!planData) {
        const codeBlockMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
        if (codeBlockMatch) {
          try {
            planData = JSON.parse(codeBlockMatch[1].trim())
            console.log('✅ 从Markdown代码块解析成功')
          } catch (e) {
            console.log('Markdown代码块解析失败，尝试修复...')
          }
        }
      }
      
      // ===== 策略2：提取完整JSON对象 =====
      if (!planData) {
        const firstOpen = rawContent.indexOf('{')
        const lastClose = rawContent.lastIndexOf('}')
        
        if (firstOpen !== -1 && lastClose > firstOpen) {
          let potentialJson = rawContent.substring(firstOpen, lastClose + 1)
          
          // ===== JSON修复步骤 =====
          
          // 步骤1：移除注释
          potentialJson = potentialJson.replace(/\/\/.*$/gm, '')
          potentialJson = potentialJson.replace(/\/\*[\s\S]*?\*\//g, '')
          
          // 步骤2：修复尾部逗号
          potentialJson = potentialJson.replace(/,(\s*[}\]])/g, '$1')
          
          // 步骤3：修复字符串中的未转义换行符
          // 这个比较复杂，需要逐字符处理
          potentialJson = fixJsonString(potentialJson)
          
          try {
            planData = JSON.parse(potentialJson)
            console.log('✅ JSON修复后解析成功')
          } catch (e) {
            console.error('JSON修复后仍解析失败:', e.message)
            
            // 步骤4：尝试更激进的修复 - 截断到最后一个有效的JSON结构
            const errorPos = findJsonErrorPosition(potentialJson, e.message)
            if (errorPos > 0) {
              console.log('尝试截断到错误位置前...', errorPos)
              // 尝试找到错误位置之前的最后一个完整的数组或对象
              const truncated = truncateAndRepairJson(potentialJson, errorPos)
              try {
                planData = JSON.parse(truncated)
                console.log('✅ 截断修复后解析成功')
              } catch (e2) {
                console.error('截断修复失败:', e2.message)
              }
            }
          }
        }
      }
      
      // ===== 策略3：逐段解析（分段提取关键数据） =====
      if (!planData) {
        console.log('尝试逐段解析...')
        planData = parseJsonBySegments(rawContent)
      }

      if (planData) {
        console.log('📦 解析到的计划数据:', planData)
        // 验证并修正计划周期和参数匹配
        const validatedPlan = validateAndFixPlan(planData, {
          goalNature,
          strictLevel,
          dailyTime,
          weakPoints
        }, totalWeeks, totalDays)
        
        return {
          success: true,
          data: validatedPlan
        }
      }
    } catch (e) {
      console.error('JSON解析流程严重错误:', e)
      console.log('原始返回数据:', result.data.substring(0, 500) + '...')
    }
    
    // 如果解析失败，返回一个基础模板
    console.warn('AI计划生成成功但解析JSON失败，回退到基础模板')
    return {
      success: true,
      isFallback: true,
      data: {
        meta: {
          goalNature,
          strictLevel,
          totalDays,
          dailyTime,
          note: isLongTermHabit ? '长期坚持，无固定结束时间' : `计划结束于：${endDateStr || '未指定'}`
        },
        stages: [
          {
            name: '第1阶段：基础准备',
            startWeek: 1,
            endWeek: Math.min(4, totalWeeks),
            description: '建立基础，养成习惯',
            goals: ['完成基础学习', '建立学习节奏']
          }
        ],
        weeklyTasks: [
          {
            week: 1,
            focus: '入门和适应',
            isReviewWeek: false,
            checkPoint: isStagedGoal ? '进度检查点' : null,
            dailyTasks: generateDefaultDailyTasks(1, strictLevel, weakPoints, dailyTime)
          }
        ],
        dailyTaskTemplate: {
          taskName: '每日学习',
          target: 1,
          unit: '小时',
          estimatedTime: dailyTime,
          description: '根据计划完成学习任务'
        }
      }
    }
  }
  
  return result
}

/**
 * 修复JSON字符串中的问题
 */
function fixJsonString(json) {
  let result = ''
  let inString = false
  let escapeNext = false
  
  for (let i = 0; i < json.length; i++) {
    const char = json[i]
    const prevChar = i > 0 ? json[i - 1] : ''
    
    if (escapeNext) {
      result += char
      escapeNext = false
      continue
    }
    
    if (char === '\\' && inString) {
      result += char
      escapeNext = true
      continue
    }
    
    if (char === '"') {
      inString = !inString
      result += char
      continue
    }
    
    // 在字符串内处理特殊字符
    if (inString) {
      // 换行符需要转义
      if (char === '\n') {
        result += '\\n'
        continue
      }
      if (char === '\r') {
        result += '\\r'
        continue
      }
      if (char === '\t') {
        result += '\\t'
        continue
      }
      // 未转义的双引号（可能是错误）
      // 这里不做处理，因为前面已经处理了转义情况
    }
    
    result += char
  }
  
  return result
}

/**
 * 从错误信息中找到JSON错误位置
 */
function findJsonErrorPosition(json, errorMsg) {
  const match = errorMsg.match(/position (\d+)/)
  if (match) {
    return parseInt(match[1])
  }
  return -1
}

/**
 * 截断并修复JSON
 */
function truncateAndRepairJson(json, errorPos) {
  // 从错误位置往前找，找到最后一个完整的位置
  let truncatePos = errorPos
  
  // 尝试找到最后一个有效的数组或对象结束位置
  let depth = 0
  let lastValidClose = -1
  let inString = false
  
  for (let i = 0; i < Math.min(truncatePos, json.length); i++) {
    const char = json[i]
    
    if (char === '"' && (i === 0 || json[i-1] !== '\\')) {
      inString = !inString
    }
    
    if (!inString) {
      if (char === '{' || char === '[') depth++
      if (char === '}' || char === ']') {
        depth--
        if (depth === 0) {
          lastValidClose = i
        }
      }
    }
  }
  
  if (lastValidClose > 0) {
    return json.substring(0, lastValidClose + 1)
  }
  
  return json.substring(0, truncatePos)
}

/**
 * 逐段解析JSON（最后的备选方案）
 */
function parseJsonBySegments(content) {
  const result = {
    meta: null,
    stages: [],
    dailyTasks: [],
    weeklyTasks: []
  }
  
  try {
    // 尝试提取 meta
    const metaMatch = content.match(/"meta"\s*:\s*\{[^}]*\}/)
    if (metaMatch) {
      try {
        result.meta = JSON.parse(metaMatch[0].replace('"meta":', ''))
      } catch (e) {}
    }
    
    // 尝试提取 stages
    const stagesMatch = content.match(/"stages"\s*:\s*\[[\s\S]*?\]\s*,?\s*"dailyTasks"/)
    if (stagesMatch) {
      const stagesStr = stagesMatch[0].replace(/"dailyTasks".*$/, '').replace(/,\s*$/, '')
      try {
        const stagesObj = JSON.parse('{' + stagesStr + '}')
        result.stages = stagesObj.stages || []
      } catch (e) {
        console.error('stages解析失败:', e)
      }
    }
    
    // 尝试提取 dailyTasks（逐个提取）
    const dayTaskRegex = /\{\s*"day"\s*:\s*(\d+)[\s\S]*?"emphasis"\s*:\s*"[^"]*"\s*\}/g
    let dayMatch
    while ((dayMatch = dayTaskRegex.exec(content)) !== null) {
      try {
        const dayTask = JSON.parse(dayMatch[0])
        result.dailyTasks.push(dayTask)
      } catch (e) {
        // 单个dayTask解析失败，跳过
      }
    }
    
    if (result.dailyTasks.length > 0 || result.stages.length > 0) {
      console.log('✅ 逐段解析成功，提取到', result.dailyTasks.length, '天任务')
      return result
    }
  } catch (e) {
    console.error('逐段解析失败:', e)
  }
  
  return null
}

/**
 * 第二步：根据用户回答生成详细计划（原版本，保持兼容）
 * @param {string} goalTitle - 目标标题
 * @param {string} goalType - 目标类型
 * @param {object} userAnswers - 用户的回答
 */
export async function generatePlan(goalTitle, goalType, userAnswers) {
  // 计算可用的周数
  let totalWeeks = 12 // 默认12周
  
  // 统一获取截止日期
  const endDateStr = userAnswers.examDate || userAnswers.targetDate
  
  if (endDateStr) {
    const endDate = new Date(endDateStr)
    const today = new Date()
    const diffTime = endDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    totalWeeks = Math.max(1, Math.ceil(diffDays / 7)) // 至少1周
  }
  
  const prompt = `
用户目标：${goalTitle}
目标类型：${goalType}

用户提供的信息：
${JSON.stringify(userAnswers, null, 2)}

⚠️ 重要约束：
- 用户的截止日期是：${endDateStr || '未指定'}
- 从现在到截止日期，总共只有 ${totalWeeks} 周时间
- 你的计划必须严格在 ${totalWeeks} 周内完成
- 所有的 startWeek 和 endWeek 必须 ≤ ${totalWeeks}
- weeklyTasks 的 week 编号不能超过 ${totalWeeks}

**用户已有计划/备注内容**：
"${userAnswers.customPlan || '用户未提供'}"

请根据以上信息，制定一个详细的、可执行的计划。

**核心指令**：
1. **如果用户提供了"已有计划/备注内容"**：
   - 请**必须**基于用户的这些内容来整合计划。
   - 将用户的资料、计划片段、想法整理成结构化的周计划和日任务。
   - 不要随意丢弃用户的核心想法，而是帮他细化和落地。
   - 如果用户指定了某天做什么（例如"周一背单词"），请严格遵守。

2. **如果用户未提供自定义内容**：
   - 则根据目标类型和答题情况，自主生成科学的计划。

3. **计划结构要求**：
   - 总体规划：分几个阶段？每个阶段的重点是什么？
   - 周计划：只为前3周生成详细的每日任务，后续周只需要周重点。

要求：
- 计划要科学合理，符合实际情况
- 任务要具体、可量化、可执行
- 难度要循序渐进
- 考虑用户的时间投入和当前基础
- **计划周期不能超过 ${totalWeeks} 周**
- **只为前3周生成包含7天的详细任务**

请以JSON格式输出：
{
  "stages": [
    {
      "name": "阶段名称（如：第1-4周：词汇基础）",
      "startWeek": 1,
      "endWeek": 4,
      "description": "阶段描述和重点",
      "goals": ["目标1", "目标2"]
    }
  ],
  "weeklyTasks": [
    {
      "week": 1,
      "focus": "本周重点",
      "dailyTasks": [
        {
          "day": 1,
          "dayName": "周一",
          "tasks": ["具体任务1", "具体任务2"],
          "estimatedTime": 60,
          "emphasis": "重点内容"
        }
        // ... 共7天（只为前3周生成）
      ]
    },
    {
      "week": 4,
      "focus": "本周重点（第4周及以后只需focus，不需要dailyTasks）"
    }
  ]
}
`
  
  const result = await callDeepSeek(prompt)
  
  if (result.success) {
    try {
      // 尝试解析JSON
      const jsonMatch = result.data.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const planData = JSON.parse(jsonMatch[0])
        
        // 验证并修正计划周期
        const validatedPlan = validateAndFixPlan(planData, totalWeeks)
        
        return {
          success: true,
          data: validatedPlan
        }
      }
    } catch (e) {
      console.error('JSON解析失败')
    }
    
    // 如果解析失败，返回一个基础模板
    return {
      success: true,
      data: {
        stages: [
          {
            name: '第1阶段：基础准备',
            startWeek: 1,
            endWeek: 4,
            description: '建立基础，养成习惯',
            goals: ['完成基础学习', '建立学习节奏']
          }
        ],
        weeklyTasks: [
          {
            week: 1,
            focus: '入门和适应',
            tasks: ['每日完成基础任务', '记录学习情况']
          }
        ],
        dailyTaskTemplate: {
          taskName: '每日学习',
          target: 1,
          unit: '小时',
          estimatedTime: 60,
          description: '根据计划完成学习任务'
        }
      }
    }
  }
  
  return result
}
