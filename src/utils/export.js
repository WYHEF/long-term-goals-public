// 数据导出工具函数

/**
 * 将JSON数据导出为CSV格式
 */
export function exportToCSV(data, filename, headers = null) {
  if (!data || data.length === 0) {
    alert('没有数据可导出')
    return
  }

  // 如果没有提供表头，使用第一条数据的键
  const csvHeaders = headers || Object.keys(data[0])
  
  // 构建CSV内容
  let csvContent = ''
  
  // 添加表头
  csvContent += csvHeaders.join(',') + '\n'
  
  // 添加数据行
  data.forEach(row => {
    const values = csvHeaders.map(header => {
      let value = row[header]
      
      // 处理特殊值
      if (value === null || value === undefined) {
        value = ''
      } else if (typeof value === 'object') {
        value = JSON.stringify(value)
      } else if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        // 如果包含逗号、引号或换行符，需要用引号包裹并转义引号
        value = '"' + value.replace(/"/g, '""') + '"'
      }
      
      return value
    })
    csvContent += values.join(',') + '\n'
  })
  
  // 创建Blob并下载
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename + '.csv')
}

/**
 * 将JSON数据导出为Excel格式（使用CSV）
 */
export function exportToExcel(data, filename, headers = null) {
  // 简化版：实际上导出为CSV，但文件名为.xls，Excel可以打开
  exportToCSV(data, filename, headers)
}

/**
 * 导出为JSON文件
 */
export function exportToJSON(data, filename) {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' })
  downloadBlob(blob, filename + '.json')
}

/**
 * 下载Blob对象
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 格式化用户数据用于导出
 */
export function formatUsersForExport(users) {
  return users.map(user => ({
    '用户ID': user.user_id,
    '创建时间': user.created_at,
    '主题': user.theme || '默认',
    '通知': user.notification_enabled ? '已启用' : '已禁用'
  }))
}

/**
 * 格式化目标数据用于导出
 */
export function formatGoalsForExport(goals) {
  return goals.map(goal => ({
    '目标ID': goal.id,
    '标题': goal.title,
    '类型': goal.type,
    '子类型': goal.sub_type || '-',
    '严格程度': goal.strict_level,
    '状态': goal.status,
    '进度': (goal.progress?.percentage || 0) + '%',
    '开始日期': goal.start_date || '-',
    '结束日期': goal.end_date || '-',
    '创建时间': goal.created_at
  }))
}

/**
 * 格式化打卡数据用于导出
 */
export function formatCheckInsForExport(checkIns) {
  return checkIns.map(checkIn => ({
    '打卡ID': checkIn.id,
    '目标标题': checkIn.goals?.title || '-',
    '打卡日期': checkIn.date,
    '状态': checkIn.status === 'completed' ? '已完成' : checkIn.status === 'partial' ? '部分完成' : '未完成',
    '用时(分钟)': checkIn.learning_data?.timeSpent || '-',
    '完成量': checkIn.learning_data?.actualAmount || '-',
    '创建时间': checkIn.created_at
  }))
}

