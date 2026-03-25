import { callDeepSeekStream } from './deepseek'

/**
 * 继续生成计划：根据前几周的打卡情况和用户反馈，生成后续周的计划
 * @param {string} goalTitle - 目标标题
 * @param {string} goalType - 目标类型
 * @param {object} existingPlan - 现有的计划数据
 * @param {array} checkIns - 打卡记录
 * @param {string} userFeedback - 用户反馈
 * @param {number} continueFromWeek - 从第几周开始继续生成
 * @param {number} generateWeeks - 生成几周的计划（默认3周）
 * @param {function} onChunk - 流式回调函数
 */
export async function continuePlanStream(goalTitle, goalType, existingPlan, checkIns, userFeedback, continueFromWeek, generateWeeks = 3, onChunk) {
  // 分析打卡情况
  const weekStats = {}
  
  checkIns.forEach(checkIn => {
    const date = new Date(checkIn.date)
    const startDate = new Date(existingPlan.startDate || Date.now())
    const weekNum = Math.floor((date - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1
    
    if (!weekStats[weekNum]) {
      weekStats[weekNum] = { total: 0, completed: 0, partial: 0, failed: 0 }
    }
    
    weekStats[weekNum].total++
    if (checkIn.status === 'completed') weekStats[weekNum].completed++
    else if (checkIn.status === 'partial') weekStats[weekNum].partial++
    else weekStats[weekNum].failed++
  })
  
  // 构建打卡情况摘要
  let checkInSummary = ''
  for (let week = 1; week < continueFromWeek; week++) {
    const stats = weekStats[week] || { total: 0, completed: 0, partial: 0, failed: 0 }
    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    checkInSummary += `第${week}周：完成率 ${completionRate}% (${stats.completed}/${stats.total}天)\n`
  }
  
  const prompt = `
你是一个专业的学习规划助手。用户正在执行一个目标，现在需要你根据前几周的执行情况，继续生成后续的详细计划。

## 目标信息
- 目标标题：${goalTitle}
- 目标类型：${goalType}

## 已有计划概览
阶段规划：
${JSON.stringify(existingPlan.stages, null, 2)}

前${continueFromWeek - 1}周的计划重点：
${existingPlan.weeklyTasks.slice(0, continueFromWeek - 1).map(w => `第${w.week}周：${w.focus}`).join('\n')}

## 打卡执行情况
${checkInSummary}

## 用户反馈
${userFeedback || '无特殊反馈'}

## 任务要求
请根据以上信息，为用户生成第 ${continueFromWeek} 周到第 ${continueFromWeek + generateWeeks - 1} 周的详细计划。

要求：
1. 分析前几周的完成情况，调整难度和节奏
2. 如果完成率高，可以适当增加难度
3. 如果完成率低，需要降低难度或调整方法
4. 考虑用户的反馈意见
5. 保持与前期计划的连贯性
6. 每周需要包含7天的详细每日任务

请以JSON格式输出（只输出JSON，不要其他内容）：
{
  "weeklyTasks": [
    {
      "week": ${continueFromWeek},
      "focus": "本周重点",
      "dailyTasks": [
        {
          "day": 1,
          "dayName": "周一",
          "tasks": ["具体任务1", "具体任务2"],
          "estimatedTime": 60,
          "emphasis": "重点内容"
        }
        // ... 共7天
      ]
    }
    // ... 共${generateWeeks}周
  ],
  "adjustmentReason": "根据打卡情况做出的调整说明"
}
`
  
  const result = await callDeepSeekStream(prompt, onChunk)
  
  if (result.success) {
    try {
      // 尝试解析JSON
      const jsonMatch = result.data.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const newPlanData = JSON.parse(jsonMatch[0])
        
        return {
          success: true,
          data: newPlanData
        }
      }
    } catch (e) {
      console.error('JSON解析失败:', e)
    }
    
    // 如果解析失败，返回基础模板
    return {
      success: true,
      data: {
        weeklyTasks: Array.from({ length: generateWeeks }, (_, i) => ({
          week: continueFromWeek + i,
          focus: `第${continueFromWeek + i}周学习重点（请手动编辑）`,
          dailyTasks: Array.from({ length: 7 }, (_, d) => ({
            day: d + 1,
            dayName: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][d],
            tasks: ['请编辑每日任务'],
            estimatedTime: 60,
            emphasis: ''
          }))
        })),
        adjustmentReason: 'AI生成失败，已创建基础模板'
      }
    }
  }
  
  return result
}
