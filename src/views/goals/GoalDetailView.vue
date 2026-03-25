<template>
  <div v-if="loading" class="flex flex-col items-center justify-center min-h-[60vh]">
    <div class="mb-4"><ArrowPathIcon class="w-12 h-12 animate-spin text-primary-500" /></div>
    <p class="text-gray-500 dark:text-gray-400">正在加载目标详情...</p>
  </div>
  
  <div v-else-if="!goal" class="flex flex-col items-center justify-center min-h-[60vh]">
    <div class="mb-4"><ExclamationTriangleIcon class="w-16 h-16 text-gray-300 dark:text-gray-600" /></div>
    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">目标不存在</h2>
    <p class="text-gray-500 dark:text-gray-400 mb-6">该目标可能已被删除或您没有权限访问。</p>
    <router-link to="/app/goals" class="btn btn-primary">
      返回目标列表
    </router-link>
  </div>
  
  <div v-else class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-300">
    <!-- 顶部导航栏 (Header) -->
    <header class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-30 transition-colors duration-300 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <router-link to="/app/goals" class="mr-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
              <ArrowLeftIcon class="w-5 h-5" />
            </router-link>
            <div class="flex flex-col">
              <h1 class="text-lg font-bold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-md">
                {{ goal.title }}
              </h1>
              <div class="flex items-center text-xs space-x-2">
                <span class="px-1.5 py-0.5 rounded text-[10px] font-medium" :class="typeBadgeClass">
                  {{ goal.type }}
                </span>
                <span v-if="goal.status === '已完成'" class="text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircleIcon class="w-3 h-3 mr-1" /> 已完成
                </span>
                <span v-else-if="goal.status === '已暂停'" class="text-yellow-600 dark:text-yellow-400 flex items-center">
                  <PauseIcon class="w-3 h-3 mr-1" /> 已暂停
                </span>
                <span v-else class="text-blue-600 dark:text-blue-400 flex items-center">
                  <PlayIcon class="w-3 h-3 mr-1" /> 进行中
                </span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <!-- 桌面端操作按钮 -->
            <div class="flex items-center space-x-2">
              <button
                v-if="goal.status === '进行中'"
                @click="pauseGoal"
                class="p-2 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-md transition-colors"
                title="暂停目标"
              >
                <PauseIcon class="w-5 h-5" />
              </button>
              <button
                v-if="goal.status === '已暂停'"
                @click="resumeGoal"
                class="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                title="恢复目标"
              >
                <PlayIcon class="w-5 h-5" />
              </button>
              <button
                @click="deleteGoal"
                class="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                title="删除目标"
              >
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <!-- Tab 导航 -->
      <div class="flex justify-center mb-8">
        <div class="inline-flex bg-gray-200 dark:bg-gray-800 p-1 rounded-md shadow-inner">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-6 py-2 rounded-sm text-sm font-medium transition-all duration-200 flex items-center"
            :class="activeTab === tab.id 
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-white shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
          >
            <component :is="tab.icon" class="w-4 h-4 mr-2" />
            {{ tab.name }}
          </button>
        </div>
      </div>

      <!-- Tab 1: 概览 (Overview) -->
      <div v-if="activeTab === 'overview'" class="space-y-6 animate-fade-in">
        
        <!-- 日历打卡视图 -->
        <div class="mb-6">
          <CheckInHistory :goal-id="goal.id" />
        </div>

        <!-- 数据概览 Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center hover:shadow-md transition-all group">
            <div class="text-gray-500 dark:text-gray-400 text-sm mb-1 group-hover:text-primary-500 transition-colors">总体进度</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ goal.progress?.percentage || 0 }}<span class="text-sm ml-1 text-gray-400">%</span>
            </div>
            <div class="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div class="bg-primary-500 h-full rounded-full transition-all duration-1000" :style="{ width: (goal.progress?.percentage || 0) + '%' }"></div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center hover:shadow-md transition-all group">
            <div class="text-gray-500 dark:text-gray-400 text-sm mb-1 group-hover:text-green-500 transition-colors">已坚持</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ completedDays }}<span class="text-sm ml-1 text-gray-400">天</span>
            </div>
             <div class="text-xs text-green-600 mt-2 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-sm">
               积累中
             </div>
          </div>
          <div class="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center hover:shadow-md transition-all group">
            <div class="text-gray-500 dark:text-gray-400 text-sm mb-1 group-hover:text-orange-500 transition-colors">连续打卡</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ streakDays }}<span class="text-sm ml-1 text-gray-400">天</span>
            </div>
            <div class="flex mt-2 space-x-0.5">
               <div v-for="i in 5" :key="i" class="w-1.5 h-1.5 rounded-full" :class="i <= (streakDays % 5 || 5) ? 'bg-orange-400' : 'bg-gray-200 dark:bg-gray-700'"></div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center hover:shadow-md transition-all group">
            <div class="text-gray-500 dark:text-gray-400 text-sm mb-1 group-hover:text-blue-500 transition-colors">剩余时间</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ daysRemaining !== null ? daysRemaining : '-' }}<span class="text-sm ml-1 text-gray-400">天</span>
            </div>
            <div class="text-xs text-gray-400 mt-2">截止: {{ formatDate(goal.end_date) }}</div>
          </div>
        </div>

        <!-- 详细进度与统计 -->
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- 左侧：当前阶段与热力图 -->
          <div class="lg:col-span-2 space-y-6">
            <!-- 当前阶段卡片 -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center text-lg">
                  <MapPinIcon class="w-5 h-5 mr-2 text-primary-500" /> 当前阶段
                </h3>
                <span class="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-md">
                  Stage {{ currentStageIndex + 1 }}/{{ goal.plan?.stages?.length || 1 }}
                </span>
              </div>
              
              <div v-if="currentStage" class="relative overflow-hidden rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-6">
                <div class="relative z-10">
                  <h4 class="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">{{ currentStage.name }}</h4>
                  <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{{ currentStage.description }}</p>
                  
                  <div class="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">
                    <span>阶段进度</span>
                    <span>{{ currentStageProgress }}%</span>
                  </div>
                  <div class="w-full bg-white dark:bg-gray-700 h-2 rounded-full overflow-hidden border border-gray-100 dark:border-gray-600">
                    <div class="bg-primary-500 h-full rounded-full transition-all duration-1000" :style="{ width: currentStageProgress + '%' }"></div>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 dark:text-gray-400 text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                暂无阶段信息
              </div>
            </div>

            <!-- 打卡热力图 -->
            <!-- CheckInHistory moved to top -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center text-lg">
                  <FireIcon class="w-5 h-5 mr-2 text-orange-500" /> 打卡概览
                </h3>
                <router-link 
                  v-if="goal.status === '进行中'"
                  :to="`/app/checkin/${goal.id}`"
                  class="text-xs text-primary-600 font-medium hover:underline"
                >
                  去打卡 &rarr;
                </router-link>
              </div>
              <div class="text-center text-gray-500 py-8 text-sm">
                <p>上方日历已展示详细打卡记录</p>
              </div>
            </div>
          </div>

          <!-- 右侧：里程碑列表 -->
          <div class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full">
              <h3 class="font-bold text-gray-900 dark:text-white mb-6 flex items-center text-lg">
                <TrophyIcon class="w-5 h-5 mr-2 text-yellow-500" /> 里程碑
              </h3>
              <div v-if="goal.milestones && goal.milestones.length > 0" class="space-y-6 relative">
                <!-- 垂直连接线 -->
                <div class="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-100 dark:bg-gray-700"></div>
                
                <div 
                  v-for="(milestone, idx) in goal.milestones" 
                  :key="idx"
                  class="relative pl-10 group"
                >
                  <!-- 节点图标 -->
                  <div 
                    class="absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all z-10"
                    :class="milestone.achieved 
                      ? 'bg-yellow-50 border-yellow-50 text-yellow-600 dark:bg-yellow-900 dark:border-yellow-900/50 dark:text-yellow-400' 
                      : 'bg-gray-50 border-white text-gray-400 dark:bg-gray-700 dark:border-gray-800 dark:text-gray-500'"
                  >
                    <TrophyIcon class="w-4 h-4" v-if="milestone.achieved" />
                    <span class="text-xs font-bold" v-else>{{ idx + 1 }}</span>
                  </div>
                  
                  <div class="pt-1">
                    <h4 
                      class="font-bold text-sm transition-colors"
                      :class="milestone.achieved ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'"
                    >
                      {{ milestone.title }}
                    </h4>
                    <p class="text-xs text-gray-400 mt-1">
                      进度达到 {{ milestone.at }}%
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-10 text-gray-400 dark:text-gray-500">
                <TrophyIcon class="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>暂无里程碑</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: 日程 (Schedule) -->
      <div v-if="activeTab === 'schedule'" class="space-y-6 animate-fade-in">
        <!-- 本周重点 -->
        <div class="bg-blue-50 dark:bg-gray-800 rounded-lg p-5 border border-blue-100 dark:border-gray-700 shadow-sm flex items-start gap-4">
          <div class="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-md text-blue-600 dark:text-blue-400 shrink-0">
            <SparklesIcon class="w-6 h-6" />
          </div>
          <div>
            <div class="font-bold text-gray-900 dark:text-white text-lg mb-1">本周重点</div>
            <div class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ currentWeekTask.focus || '暂无设定' }}</div>
          </div>
        </div>

        <!-- 日程列表 -->
        <div class="space-y-4">
          <div
            v-for="day in visibleDailyPlans"
            :key="day.dayNumber"
            class="group relative bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden"
            :class="[
              day.isToday ? 'border-primary-500 ring-1 ring-primary-500 z-10 shadow-md transform scale-[1.01]' : 'border-gray-200 dark:border-gray-700',
              day.hasCheckedIn ? 'bg-gray-50/80 dark:bg-gray-800/80' : ''
            ]"
            @click="viewDayDetail(day)"
          >
            <!-- 进度条背景 -->
            <div class="absolute left-0 top-0 bottom-0 w-1.5 transition-colors" :class="getDayBarClass(day)"></div>
            
            <div class="flex items-center p-4 pl-6">
              <!-- 左侧：日期 -->
              <div class="flex flex-col items-center mr-6 min-w-[60px] text-center">
                <div class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 font-medium">Day {{ day.dayNumber }}</div>
                <div class="font-bold text-xl text-gray-900 dark:text-white leading-none mb-1">{{ day.dateObj.format('DD') }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ day.dateObj.format('MM月') }}</div>
              </div>
              
              <div class="w-px h-10 bg-gray-100 dark:bg-gray-700 mr-6"></div>

              <!-- 中间：内容 -->
              <div class="flex-1 min-w-0 py-1">
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ getWeekday(day.date) }}</span>
                  <span v-if="day.stage" class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                    {{ day.stage.name }}
                  </span>
                </div>
                
                <div class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  <span v-if="day.dayTasks && day.dayTasks.tasks && day.dayTasks.tasks.length > 0">
                    {{ day.dayTasks.tasks.join('、') }}
                  </span>
                  <span v-else-if="goal.plan.dailyTaskTemplate">
                    {{ goal.plan.dailyTaskTemplate.taskName }}
                  </span>
                  <span v-else class="text-gray-400 italic font-normal">无具体任务</span>
                </div>
              </div>
              
              <!-- 右侧：状态图标 -->
              <div class="ml-4 flex items-center">
                <div v-if="day.hasCheckedIn" class="flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                  <CheckCircleIcon class="w-4 h-4 mr-1.5" />
                  <span class="text-xs font-bold">已完成</span>
                </div>
                <div v-else-if="day.isToday" class="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full">
                  <span class="text-xs font-bold">今天</span>
                </div>
                <div v-else-if="day.isPast" class="text-gray-400 dark:text-gray-600 px-2">
                  <XMarkIcon class="w-5 h-5" />
                </div>
                <div v-else class="text-gray-300 dark:text-gray-600 px-2">
                  <ClockIcon class="w-5 h-5" />
                </div>
                
                <IconChevronRight class="w-4 h-4 text-gray-300 ml-3 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center pt-4">
            <button class="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
                查看更多日程...
            </button>
        </div>
      </div>

      <!-- Tab 3: 详情 (Details) -->
      <div v-if="activeTab === 'details'" class="animate-fade-in space-y-8">
        <!-- 阶段规划 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">阶段规划</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">长远目标的阶段性拆解</p>
            </div>
            <div class="flex items-center gap-2">
                <button
                  v-if="!isEditingStages"
                  @click="toggleStageEditMode"
                  class="btn btn-sm btn-secondary flex items-center shadow-sm"
                >
                  <PencilSquareIcon class="w-4 h-4 mr-1" /> 编辑规划
                </button>
                <div v-else class="flex gap-2">
                    <button @click="cancelStageEdit" class="btn btn-sm btn-ghost text-gray-500">取消</button>
                    <button @click="saveStages" class="btn btn-sm btn-primary">保存</button>
                </div>
                
                <button
                  v-if="canContinuePlan && !isEditingStages"
                  @click="showContinuePlanModal = true"
                  class="btn btn-sm btn-ghost text-primary-600 flex items-center"
                >
                  <SparklesIcon class="w-4 h-4 mr-1" /> 智能续写
                </button>
            </div>
          </div>
          
          <div class="p-6">
            <div v-if="!isEditingStages" class="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-10 py-2">
              <div v-for="(stage, index) in goal.plan?.stages" :key="index" class="relative pl-8 group">
                <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-500 group-hover:scale-125 transition-transform shadow-sm"></div>
                <div class="bg-white dark:bg-gray-700/30 rounded-lg p-5 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all">
                  <div class="flex items-start justify-between mb-2">
                    <h4 class="font-bold text-lg text-gray-900 dark:text-white">{{ stage.name }}</h4>
                    <span class="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">Stage {{ index + 1 }}</span>
                  </div>
                  <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{{ stage.description }}</p>
                  
                  <div v-if="stage.goals && stage.goals.length > 0" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-600/50">
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">阶段目标：</div>
                    <div class="flex flex-wrap gap-2">
                      <span v-for="(g, i) in stage.goals" :key="i" class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30">
                        {{ g }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 编辑模式 -->
            <div v-else class="space-y-6">
                <div v-for="(stage, index) in editingStages" :key="index" class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <div class="flex justify-between mb-3 gap-4">
                        <input v-model="stage.name" class="input font-bold flex-1" placeholder="阶段名称">
                        <button @click="removeStage(index)" class="text-red-500 hover:text-red-700 text-sm flex items-center">
                            <TrashIcon class="w-4 h-4 mr-1"/> 删除
                        </button>
                    </div>
                    <textarea v-model="stage.description" class="input w-full mb-3" rows="2" placeholder="阶段描述"></textarea>
                    
                    <!-- Stage Goals -->
                    <div class="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                        <div class="text-xs text-gray-500 mb-2">阶段目标</div>
                        <div class="flex flex-wrap gap-2 items-center">
                            <span v-for="(g, i) in stage.goals" :key="i" class="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded text-xs flex items-center">
                                {{ g }}
                                <button @click="removeStageGoal(index, i)" class="ml-1 text-blue-400 hover:text-blue-700">×</button>
                            </span>
                            <button @click="addStageGoal(index)" class="text-xs text-primary-600 border border-dashed border-primary-300 px-2 py-1 rounded hover:bg-primary-50">+ 添加目标</button>
                        </div>
                    </div>
                </div>
                <button @click="addStage" class="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg hover:border-primary-500 hover:text-primary-500 transition-colors text-center font-medium">
                    + 添加新阶段
                </button>
            </div>
          </div>
        </div>

        <!-- 每日任务模板 -->
        <div v-if="goal.plan?.dailyTaskTemplate" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">每日任务模板</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">默认的每日重复任务设置</p>
            </div>
            <button
              @click="toggleDailyTaskTemplateEditMode"
              class="btn btn-sm transition-colors"
              :class="isEditingDailyTaskTemplate ? 'btn-primary' : 'btn-secondary'"
            >
              {{ isEditingDailyTaskTemplate ? '保存设置' : '修改模板' }}
            </button>
          </div>

          <div class="p-6">
            <div v-if="!isEditingDailyTaskTemplate" class="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="space-y-1">
                  <div class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">任务名称</div>
                  <div class="text-lg font-bold text-gray-900 dark:text-white">{{ goal.plan.dailyTaskTemplate.taskName }}</div>
                </div>
                <div class="space-y-1">
                  <div class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">目标量</div>
                  <div class="text-lg font-bold text-gray-900 dark:text-white font-mono">
                    {{ goal.plan.dailyTaskTemplate.target }} <span class="text-sm font-normal text-gray-500">{{ goal.plan.dailyTaskTemplate.unit }}</span>
                  </div>
                </div>
                <div class="space-y-1">
                  <div class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">预计耗时</div>
                  <div class="text-lg font-bold text-gray-900 dark:text-white font-mono">
                    {{ goal.plan.dailyTaskTemplate.estimatedTime }} <span class="text-sm font-normal text-gray-500">分钟</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 编辑模式 -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">任务名称</label>
                <input
                  v-model="editingTemplate.taskName"
                  type="text"
                  class="input w-full"
                  placeholder="例如：背单词"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">目标量</label>
                <div class="flex gap-2">
                  <input
                    v-model="editingTemplate.target"
                    type="number"
                    class="input flex-1"
                    placeholder="20"
                  />
                  <input
                    v-model="editingTemplate.unit"
                    type="text"
                    class="input w-24"
                    placeholder="单位"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">预计耗时 (分钟)</label>
                <input
                  v-model="editingTemplate.estimatedTime"
                  type="number"
                  class="input w-full"
                  placeholder="30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 弹窗组件 -->
    <!-- 打卡详情弹窗 -->
    <div
      v-if="showDetailModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity"
      @click="closeDetailModal"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto transform transition-all scale-100"
        @click.stop
      >
        <div class="sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {{ selectedDay?.dateObj.format('MM月DD日') }}
              <span class="text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">Day {{ selectedDay?.dayNumber }}</span>
            </h3>
          </div>
          <button @click="closeDetailModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6 space-y-6">
           <!-- 状态卡片 -->
           <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <div class="flex items-center">
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                  :class="selectedDay?.hasCheckedIn ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'"
                >
                  <CheckCircleIcon class="w-6 h-6" v-if="selectedDay?.hasCheckedIn" />
                  <ClockIcon class="w-6 h-6" v-else />
                </div>
                <div>
                  <div class="font-bold text-gray-900 dark:text-white">
                    {{ selectedDay?.hasCheckedIn ? '已完成打卡' : (selectedDay?.isPast ? '未打卡' : '待完成') }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ selectedDay?.hasCheckedIn ? '太棒了，继续保持！' : (selectedDay?.isPast ? '该日任务未完成' : '请按时完成任务') }}
                  </div>
                </div>
              </div>
              
              <button
                v-if="!selectedDay?.hasCheckedIn && selectedDay?.isPast && goal.status === '进行中'"
                @click="startMakeUpCheckIn"
                class="btn btn-secondary btn-sm inline-flex items-center"
              >
                <ArrowPathIcon class="w-4 h-4 mr-1" /> 补打卡
              </button>
           </div>

           <!-- 任务内容 -->
           <div>
             <h4 class="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
               <ClipboardDocumentListIcon class="w-5 h-5 mr-2 text-primary-500" /> 当日任务
             </h4>
             <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
               <div v-if="selectedDay?.dayTasks?.tasks?.length">
                 <ul class="space-y-3">
                   <li v-for="(t, i) in selectedDay.dayTasks.tasks" :key="i" class="flex items-start text-gray-700 dark:text-gray-300">
                     <span class="inline-block w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 mr-2 shrink-0"></span>
                     <span class="leading-relaxed">{{ t }}</span>
                   </li>
                 </ul>
               </div>
               <div v-else class="text-gray-500 italic text-center py-4">无具体任务描述</div>
             </div>
           </div>
        </div>
      </div>
    </div>

    <!-- 补打卡弹窗 -->
    <div
      v-if="showMakeUpModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div class="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">补打卡确认</h3>
        </div>
        <div class="p-6">
          <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            您确定要补打 <span class="font-bold text-primary-600 dark:text-primary-400">{{ selectedDay?.dateObj.format('MM月DD日') }}</span> 的卡吗？
            <br/><span class="text-xs text-gray-500 mt-1 block">补打卡将标记该日任务为已完成。</span>
          </p>
          <div class="flex justify-end gap-3">
            <button @click="showMakeUpModal = false" class="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">取消</button>
            <button @click="confirmMakeUpCheckIn" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md shadow-sm transition-colors">确认补卡</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 继续生成计划弹窗 -->
    <div v-if="showContinuePlanModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
       <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full shadow-2xl">
         <div class="flex items-center gap-3 mb-4 text-primary-600 dark:text-primary-400">
           <SparklesIcon class="w-8 h-8" />
           <h3 class="text-xl font-bold text-gray-900 dark:text-white">智能续写计划</h3>
         </div>
         <p class="text-gray-600 dark:text-gray-300 mb-6">
           当前计划即将结束，是否让 AI 根据您的执行情况，为您生成下一阶段的计划？
         </p>
         <div class="flex justify-end gap-3">
           <button @click="closeContinuePlanModal" class="btn btn-secondary">再等等</button>
           <button @click="startContinueGeneration" class="btn btn-primary shadow-lg shadow-primary-500/30">开始生成</button>
         </div>
       </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGoalsStore } from '@/stores/goals'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'
import CheckInHistory from '@/components/CheckInHistory.vue'
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  PauseIcon,
  PlayIcon,
  PencilSquareIcon,
  TrashIcon,
  HomeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CheckIcon,
  MapPinIcon,
  FireIcon,
  TrophyIcon,
  SparklesIcon,
  XMarkIcon,
  ClockIcon,
  ChevronRightIcon as IconChevronRight
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const goalsStore = useGoalsStore()
const userStore = useUserStore()

const loading = ref(true)
const goal = ref(null)
const activeTab = ref('overview')
const showDetailModal = ref(false)
const selectedDay = ref(null)
const showMakeUpModal = ref(false)
const showContinuePlanModal = ref(false)
const isEditingDailyTaskTemplate = ref(false)
const editingTemplate = ref({})

// 阶段编辑相关
const isEditingStages = ref(false)
const editingStages = ref([])

// Tabs Configuration
const tabs = [
  { id: 'overview', name: '概览', icon: HomeIcon },
  { id: 'schedule', name: '日程', icon: CalendarIcon },
  { id: 'details', name: '详情', icon: DocumentTextIcon },
]

// Computed Properties
const typeBadgeClass = computed(() => {
  if (!goal.value) return ''
  const classes = {
    '学习类': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    '健康类': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    '生活类': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  }
  return classes[goal.value.type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
})

const currentDayNumber = computed(() => {
  if (!goal.value) return 0
  const start = dayjs(goal.value.start_date)
  const today = dayjs()
  return today.diff(start, 'day') + 1
})

const daysRemaining = computed(() => {
  if (!goal.value || !goal.value.end_date) return null
  const end = dayjs(goal.value.end_date)
  const today = dayjs()
  const diff = end.diff(today, 'day')
  return diff > 0 ? diff : 0
})

const completedDays = computed(() => {
  // Mock data or calculate from goal.progress
  return goal.value?.progress?.completedDays || 0
})

const streakDays = computed(() => {
  // Mock data or calculate from goal.progress
  return goal.value?.progress?.streakDays || 0
})

const isTodayCheckedIn = computed(() => {
  // This usually requires checking check_ins table, but we can mock or use store
  // Assuming goalsStore might have this info or we fetch it.
  // For now, let's check if there is a check-in record for today in local state if available
  // Or simpler: rely on goal.status or similar.
  // Ideally we should fetch today's checkin status.
  return false // Placeholder, should be real logic
})

const todayStatusText = computed(() => {
  if (isTodayCheckedIn.value) return '今日任务已完成！'
  return '今日概览'
})

const todayTask = computed(() => {
  if (!goal.value?.plan?.daily_plans) return null
  const todayStr = dayjs().format('YYYY-MM-DD')
  // Find plan for today if stored by date, or by day number
  // Assuming simplified logic for now
  return null
})

const currentStageIndex = computed(() => {
  return goal.value?.progress?.currentStage - 1 || 0
})

const currentStage = computed(() => {
  if (!goal.value?.plan?.stages) return null
  return goal.value.plan.stages[currentStageIndex.value]
})

const currentStageProgress = computed(() => {
  // Mock logic
  return 45 
})

const canContinuePlan = computed(() => {
  return daysRemaining.value !== null && daysRemaining.value < 7
})

// Generate visible daily plans (e.g. current week or window)
const visibleDailyPlans = computed(() => {
  if (!goal.value) return []
  const plans = []
  const today = dayjs()
  const start = today.subtract(2, 'day') // Show a few past days
  
  for (let i = 0; i < 7; i++) {
    const date = start.add(i, 'day')
    const isToday = date.isSame(today, 'day')
    const isPast = date.isBefore(today, 'day')
    const dayNum = date.diff(dayjs(goal.value.start_date), 'day') + 1
    
    plans.push({
      date: date.format('YYYY-MM-DD'),
      dateObj: date,
      dayNumber: dayNum,
      isToday,
      isPast,
      hasCheckedIn: false, // Need real data
      stage: currentStage.value, // Simplified
      dayTasks: { tasks: [] } // Placeholder
    })
  }
  return plans
})

const currentWeekTask = computed(() => {
  return { focus: '保持节奏，稳步推进' } // Placeholder
})

// Methods
async function fetchGoal() {
  loading.value = true
  try {
    const id = route.params.id
    if (!id) {
      console.error('Goal ID is missing from route')
      loading.value = false
      return
    }
    
    console.log('Fetching goal details for ID:', id)
    const data = await goalsStore.getGoalById(id)
    
    if (data) {
      goal.value = data
      console.log('Goal details loaded:', data.title)
    } else {
      console.error('Goal not found in database')
      goal.value = null
    }
  } catch (error) {
    console.error('Error fetching goal details:', error)
    goal.value = null
  } finally {
    loading.value = false
  }
}

function formatDate(date) {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

function getWeekday(date) {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[dayjs(date).day()]
}

function getDayBarClass(day) {
  if (day.hasCheckedIn) return 'bg-green-500'
  if (day.isToday) return 'bg-primary-500'
  if (day.isPast) return 'bg-gray-300 dark:bg-gray-600'
  return 'bg-gray-200 dark:bg-gray-700'
}

function viewDayDetail(day) {
  selectedDay.value = day
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedDay.value = null
}

function startMakeUpCheckIn() {
  closeDetailModal()
  showMakeUpModal.value = true
}

async function confirmMakeUpCheckIn() {
  // Logic to call API
  showMakeUpModal.value = false
  alert('补打卡功能开发中')
}

function toggleDailyTaskTemplateEditMode() {
  if (isEditingDailyTaskTemplate.value) {
    // Save logic
    goal.value.plan.dailyTaskTemplate = { ...editingTemplate.value }
    // API call to save goal (This needs to be implemented properly, maybe use updateGoal like saveStages)
    goalsStore.updateGoal(goal.value.id, {
        plan: goal.value.plan
    }).then(res => {
        if(res.success) alert('设置已保存')
        else alert('保存失败')
    })
  } else {
    editingTemplate.value = { ...goal.value.plan.dailyTaskTemplate }
  }
  isEditingDailyTaskTemplate.value = !isEditingDailyTaskTemplate.value
}

// Stage Editing Methods
function toggleStageEditMode() {
  if (isEditingStages.value) {
    saveStages()
  } else {
    editingStages.value = JSON.parse(JSON.stringify(goal.value.plan?.stages || []))
    isEditingStages.value = true
  }
}

function cancelStageEdit() {
  isEditingStages.value = false
  editingStages.value = []
}

async function saveStages() {
  try {
    loading.value = true
    if (editingStages.value.length === 0) {
      alert('至少需要一个阶段')
      loading.value = false
      return
    }
    
    const updatedPlan = {
      ...goal.value.plan,
      stages: editingStages.value
    }
    
    const result = await goalsStore.updateGoal(goal.value.id, {
      plan: updatedPlan
    })
    
    if (result.success) {
      goal.value.plan = updatedPlan
      isEditingStages.value = false
      alert('规划已更新')
    } else {
      alert('保存失败: ' + result.error)
    }
  } catch (e) {
    console.error(e)
    alert('保存出错')
  } finally {
    loading.value = false
  }
}

function addStage() {
  editingStages.value.push({
    name: '新阶段',
    description: '阶段描述',
    goals: []
  })
}

function removeStage(index) {
  if (confirm('确定删除该阶段吗？')) {
    editingStages.value.splice(index, 1)
  }
}

function addStageGoal(stageIndex) {
    const g = prompt('请输入阶段目标')
    if(g) {
        if(!editingStages.value[stageIndex].goals) editingStages.value[stageIndex].goals = []
        editingStages.value[stageIndex].goals.push(g)
    }
}

function removeStageGoal(stageIndex, goalIndex) {
    editingStages.value[stageIndex].goals.splice(goalIndex, 1)
}


async function pauseGoal() {
  if (confirm('确定要暂停这个目标吗？')) {
    // API call
    await goalsStore.pauseGoal(goal.value.id)
    goal.value.status = '已暂停'
  }
}

async function resumeGoal() {
   // API call
   await goalsStore.resumeGoal(goal.value.id)
   goal.value.status = '进行中'
}

async function deleteGoal() {
  if (confirm('确定要删除这个目标吗？此操作不可恢复。')) {
    await goalsStore.deleteGoal(goal.value.id)
    router.push('/app/goals')
  }
}

function startContinueGeneration() {
  // Logic
  alert('AI 续写功能开发中')
  closeContinuePlanModal()
}

function closeContinuePlanModal() {
  showContinuePlanModal.value = false
}

onMounted(() => {
  fetchGoal()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.input {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2;
}

.btn {
  @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200;
}

.btn-primary {
  @apply border-transparent text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-600 dark:hover:bg-primary-700;
}

.btn-secondary {
  @apply border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600;
}

.btn-danger {
  @apply border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500;
}

.btn-ghost {
  @apply border-transparent bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800;
}

.btn-sm {
  @apply px-3 py-1.5 text-xs;
}
</style>
