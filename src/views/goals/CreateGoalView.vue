<template>
  <div class="max-w-7xl mx-auto space-y-6 px-4">
    <!-- 恢复进度提示弹窗 -->
    <div v-if="showRestorePrompt" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
            <ArrowPathIcon class="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">检测到未完成的计划</h3>
        </div>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          您上次正在创建目标「{{ savedProgress?.goalData?.title || '未命名' }}」，是否继续制定？
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="rejectRestore"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            重新开始
          </button>
          <button
            @click="acceptRestore"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            继续制定
          </button>
        </div>
      </div>
    </div>
    
    <!-- 进度指示器 -->
    <div class="card card-body">
      <div class="flex items-center justify-between">
        <div
          v-for="(stepInfo, index) in steps"
          :key="index"
          class="flex items-center"
          :class="{ 'flex-1': index < steps.length - 1 }"
        >
          <div class="flex flex-col items-center">
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all text-sm',
                step === index + 1
                  ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900'
                  : step > index + 1
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              ]"
            >
              <svg v-if="step > index + 1" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="mt-2 text-xs font-medium" :class="step >= index + 1 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'">{{ stepInfo }}</div>
          </div>
          <div
            v-if="index < steps.length - 1"
            :class="[
              'flex-1 h-0.5 mx-4 transition-all',
              step > index + 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
            ]"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- 步骤1：输入目标 -->
    <div v-if="step === 1" class="card card-body">
      <h2 class="section-title text-xl">基本信息</h2>
      <div class="space-y-6">
        <div>
          <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
            目标名称
          </label>
          <input
            v-model="goalData.title"
            type="text"
            placeholder="例如：考取英语四级证书"
            class="input text-base"
            @keyup.enter="startAIAnalysis"
          />
        </div>
        
        <div>
          <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
            目标类型
          </label>
          <div class="grid grid-cols-2 gap-4">
            <button
              @click="goalData.type = '学习类'"
              :class="[
                'p-5 rounded border transition-all text-left flex items-start space-x-3 group',
                goalData.type === '学习类'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
              ]"
            >
              <div class="p-2 rounded bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm group-hover:border-gray-200 dark:group-hover:border-gray-600">
                <AcademicCapIcon class="h-7 w-7 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <div class="font-semibold text-gray-900 dark:text-white text-base">学习提升</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">考证、技能学习、自我提升</div>
              </div>
            </button>
            <button
              @click="goalData.type = '健康类'"
              :class="[
                'p-5 rounded border transition-all text-left flex items-start space-x-3 group',
                goalData.type === '健康类'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
              ]"
            >
              <div class="p-2 rounded bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm group-hover:border-gray-200 dark:group-hover:border-gray-600">
                <HeartIcon class="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div class="font-semibold text-gray-900 dark:text-white text-base">健康生活</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">运动、睡眠、饮食习惯</div>
              </div>
            </button>
          </div>
        </div>
        
        <div class="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
          <router-link to="/app/goals" class="btn btn-secondary">
            取消
          </router-link>
          <button
            @click="goToDetailStep"
            :disabled="!canProceedStep1"
            class="btn btn-primary"
            :class="{ 'opacity-50 cursor-not-allowed': !canProceedStep1 }"
          >
            下一步
          </button>
        </div>
      </div>
    </div>
    
    <!-- 步骤2：用户回答问题 -->
    <div v-if="step === 2" class="card card-body">
      <h2 class="section-title text-xl">完善目标详情</h2>
      
      <!-- 学习类问题 -->
      <div v-if="goalData.type === '学习类'" class="space-y-6">
        <!-- 目标性质选择 -->
        <div>
          <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
            目标性质
          </label>
          <div class="grid grid-cols-2 gap-4">
            <button
              type="button"
              @click="goalData.goalNature = 'continuous'"
              :class="[
                'p-5 rounded border transition-all text-left flex items-start space-x-3 group',
                goalData.goalNature === 'continuous'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
              ]"
            >
              <div class="mt-0.5">
                <ArrowPathIcon class="h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" :class="{'text-primary-600 dark:text-primary-400': goalData.goalNature === 'continuous'}" />
              </div>
              <div>
                <div class="font-semibold text-gray-900 dark:text-white text-base">长期习惯</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">每日坚持，无固定结束时间</div>
              </div>
            </button>
            <button
              type="button"
              @click="goalData.goalNature = 'staged'"
              :class="[
                'p-5 rounded border transition-all text-left flex items-start space-x-3 group',
                goalData.goalNature === 'staged'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
              ]"
            >
              <div class="mt-0.5">
                <FlagIcon class="h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" :class="{'text-primary-600 dark:text-primary-400': goalData.goalNature === 'staged'}" />
              </div>
              <div>
                <div class="font-semibold text-gray-900 dark:text-white text-base">阶段目标</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">有明确的达成期限和里程碑</div>
              </div>
            </button>
          </div>
        </div>
        
        <!-- 只有阶段性目标才需要填写截止日期 -->
        <div v-if="goalData.goalNature === 'staged'">
          <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
            截止日期
          </label>
          <input
            v-model="userAnswers.examDate"
            type="date"
            class="input text-base"
          />
        </div>
        
        <div>
          <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
            当前基础
          </label>
          <textarea
            v-model="userAnswers.currentLevel"
            placeholder="请简述您当前的基础情况..."
            rows="3"
            class="input resize-none text-base"
          />
        </div>
        
        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
              每日投入时间 (分钟)
            </label>
            <div class="relative">
              <input
                v-model.number="userAnswers.dailyTime"
                type="number"
                placeholder="60"
                class="input pr-12 text-base"
              />
              <span class="absolute right-3 top-3 text-gray-400 text-base">min</span>
            </div>
          </div>
          <div>
            <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
              薄弱环节
            </label>
            <input
              v-model="userAnswers.weakPoints"
              type="text"
              placeholder="例如：词汇量不足"
              class="input text-base"
            />
          </div>
        </div>

        <!-- 新增：已有计划/备注 -->
        <div>
          <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
            补充资料或已有计划 (可选)
          </label>
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-3">
            如果您已有相关资料或初步想法，请在此补充。AI 将基于此进行优化。
          </div>
          
          <div class="mb-4 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary-400 dark:hover:border-primary-400 transition-all cursor-pointer" @click="$refs.fileInput.click()">
            <input
              type="file"
              ref="fileInput"
              class="hidden"
              accept="image/*,.txt,.md"
              @change="handleFileUpload"
            />
            
            <div v-if="isReadingFile" class="text-primary-600 dark:text-primary-400 flex flex-col items-center">
              <ArrowPathIcon class="animate-spin h-6 w-6 mb-2" />
              <span class="text-sm">正在解析文件...</span>
            </div>
            
            <div v-else class="flex flex-col items-center text-gray-500 dark:text-gray-400">
              <ArrowUpTrayIcon class="h-8 w-8 mb-2 text-gray-400 dark:text-gray-500" />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">点击上传文件</span>
              <span class="text-xs text-gray-400 dark:text-gray-500 mt-1">支持图片、TXT、Markdown</span>
            </div>
          </div>

          <textarea
            v-model="userAnswers.customPlan"
            rows="4"
            class="input resize-none text-base"
            placeholder="您可以直接粘贴已有计划，或描述您的具体需求..."
          ></textarea>
        </div>
      </div>
      
      <!-- 健康类问题 -->
      <div v-else-if="goalData.type === '健康类'" class="space-y-6">
        <!-- 目标性质选择 -->
        <div>
          <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
            目标性质
          </label>
          <div class="grid grid-cols-2 gap-4">
            <button
              type="button"
              @click="goalData.goalNature = 'continuous'"
              :class="[
                'p-5 rounded border transition-all text-left flex items-start space-x-3 group',
                goalData.goalNature === 'continuous'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
              ]"
            >
              <div class="mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" :class="{'text-primary-600 dark:text-primary-400': goalData.goalNature === 'continuous'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <div class="font-semibold text-gray-900 dark:text-white text-base">长期习惯</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">每日坚持，无固定结束时间</div>
              </div>
            </button>
            <button
              type="button"
              @click="goalData.goalNature = 'staged'"
              :class="[
                'p-5 rounded border transition-all text-left flex items-start space-x-3 group',
                goalData.goalNature === 'staged'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
              ]"
            >
              <div class="mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" :class="{'text-primary-600 dark:text-primary-400': goalData.goalNature === 'staged'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <div class="font-semibold text-gray-900 dark:text-white text-base">阶段目标</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">有明确的达成期限和里程碑</div>
              </div>
            </button>
          </div>
        </div>
        
        <div>
          <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
            具体类型
          </label>
          <select v-model="goalData.sub_type" class="input text-base">
            <option value="">请选择类型</option>
            <option value="睡眠">睡眠改善</option>
            <option value="喝水">饮水习惯</option>
            <option value="减肥">体重管理</option>
            <option value="运动">体能训练</option>
          </select>
        </div>
        
        <!-- 睡眠相关 -->
        <div v-if="goalData.sub_type === '睡眠'" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                目标入睡时间
              </label>
              <input
                v-model="healthConfig.targetSleepTime"
                type="time"
                class="input text-base"
              />
            </div>
            <div>
              <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                目标起床时间
              </label>
              <input
                v-model="healthConfig.targetWakeTime"
                type="time"
                class="input text-base"
              />
            </div>
          </div>
          <div>
            <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
              目标睡眠时长 (小时)
            </label>
            <input
              v-model.number="healthConfig.targetSleepHours"
              type="number"
              step="0.5"
              class="input text-base"
            />
          </div>
        </div>
        
        <!-- 喝水相关 -->
        <div v-if="goalData.sub_type === '喝水'">
          <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
            每日目标 (杯)
          </label>
          <input
            v-model.number="healthConfig.targetWaterCups"
            type="number"
            placeholder="8"
            class="input text-base"
          />
        </div>
        
        <!-- 减肥相关 -->
        <div v-if="goalData.sub_type === '减肥'" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                当前体重 (kg)
              </label>
              <input
                v-model.number="healthConfig.startWeight"
                type="number"
                step="0.1"
                class="input text-base"
              />
            </div>
            <div>
              <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                目标体重 (kg)
              </label>
              <input
                v-model.number="healthConfig.targetWeight"
                type="number"
                step="0.1"
                class="input text-base"
              />
            </div>
          </div>
        </div>
        
        <!-- 只有阶段性目标才需要填写截止日期 -->
        <div v-if="goalData.goalNature === 'staged'">
          <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
            期望达成日期
          </label>
          <input
            v-model="healthConfig.targetDate"
            type="date"
            class="input text-base"
          />
        </div>

        <!-- 新增：已有计划/备注 -->
        <div>
          <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
            补充资料或已有计划 (可选)
          </label>
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-3">
            如果您已有相关资料或初步想法，请在此补充。AI 将基于此进行优化。
          </div>
          
          <div class="mb-4 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary-400 dark:hover:border-primary-400 transition-all cursor-pointer" @click="$refs.healthFileInput.click()">
            <input
              type="file"
              ref="healthFileInput"
              class="hidden"
              accept="image/*,.txt,.md"
              @change="handleHealthFileUpload"
            />
            
            <div v-if="isReadingFile" class="text-primary-600 dark:text-primary-400 flex flex-col items-center">
              <ArrowPathIcon class="animate-spin h-6 w-6 mb-2" />
              <span class="text-sm">正在解析文件...</span>
            </div>
            
            <div v-else class="flex flex-col items-center text-gray-500 dark:text-gray-400">
              <ArrowUpTrayIcon class="h-8 w-8 mb-2 text-gray-400 dark:text-gray-500" />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">点击上传文件</span>
              <span class="text-xs text-gray-400 dark:text-gray-500 mt-1">支持图片、TXT、Markdown</span>
            </div>
          </div>

          <textarea
            v-model="healthConfig.customPlan"
            rows="4"
            class="input resize-none text-base"
            placeholder="您可以直接粘贴已有计划，或描述您的具体需求..."
          ></textarea>
        </div>
      </div>
      
      <!-- 严格程度选择 -->
      <div class="pt-6 border-t border-gray-100 dark:border-gray-700">
        <label class="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
          执行严格度
        </label>
        <div class="grid grid-cols-3 gap-4">
          <button
            v-for="level in ['严格', '标准', '弹性']"
            :key="level"
            @click="goalData.strict_level = level"
            :class="[
              'p-4 rounded border transition-all text-center',
              goalData.strict_level === level
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500 text-primary-700 dark:text-primary-400'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            ]"
          >
            <div class="font-semibold text-base">{{ level }}</div>
            <div class="text-sm opacity-75 mt-1">
              {{ strictLevelDesc[level] }}
            </div>
          </button>
        </div>
      </div>
      
      <div class="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-700 pb-20 md:pb-0">
        <button @click="step = 1" class="btn btn-secondary">
          上一步
        </button>
        <div class="flex space-x-3">
          <button
            @click="skipPlanGeneration"
            :disabled="!canProceedStep3"
            class="btn btn-secondary"
            :class="{ 'opacity-50 cursor-not-allowed': !canProceedStep3 }"
          >
            手动创建
          </button>
          <button
            @click="generatePlan"
            :disabled="!canProceedStep3 || generating"
            class="btn btn-primary"
            :class="{ 'opacity-50 cursor-not-allowed': !canProceedStep3 || generating }"
          >
            <span v-if="generating">正在生成...</span>
            <span v-else>生成智能计划</span>
          </button>
        </div>
      </div>
      
      <!-- AI生成进度显示 - 已移至步骤3 -->
    </div>
    
    <!-- 步骤3：确认计划 -->
    <div v-if="step === 3" class="space-y-4">
      
      <!-- AI生成过程视图 -->
      <div v-if="generating" class="card card-body border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 animate-bounce border border-primary-200 dark:border-primary-800">
              <SparklesIcon class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">AI正在规划中...</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">正在根据您的目标和资料生成专属计划</p>
            </div>
          </div>
          <span class="px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium animate-pulse flex items-center border border-primary-200 dark:border-primary-800">
            <CpuChipIcon class="w-4 h-4 mr-1.5" />
            Thinking...
          </span>
        </div>
        
        <div class="grid grid-cols-3 gap-4">
          <!-- 左侧：流式输出区域 -->
          <div class="col-span-2">
            <div 
              ref="streamingContainer"
              class="bg-gray-900 rounded-lg p-5 font-mono text-sm text-gray-300 overflow-y-auto shadow-sm border-2 border-gray-800"
              style="height: 400px;"
            >
              <div class="whitespace-pre-wrap leading-relaxed">
                {{ streamingContent || '等待AI响应...' }}<span class="inline-block w-2 h-4 bg-green-500 animate-pulse ml-1 align-middle"></span>
              </div>
            </div>
          </div>
          
          <!-- 右侧：信息和操作 -->
          <div class="col-span-1 space-y-3">
            <!-- 信息卡片 -->
            <div class="bg-gradient-to-br from-blue-50 to-primary-50 dark:from-gray-800 dark:to-gray-750 rounded-lg p-4 border border-blue-200 dark:border-gray-700">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-3 flex items-center text-sm">
                <LightBulbIcon class="w-4 h-4 mr-2 text-yellow-500" /> 
                生成状态
              </h3>
              <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div class="flex justify-between items-center">
                  <span>预计耗时</span>
                  <span class="text-gray-900 dark:text-gray-200 font-semibold">30-60秒</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-gradient-to-r from-primary-500 to-blue-500 h-1.5 rounded-full animate-progress-indeterminate"></div>
                </div>
                <div class="flex justify-between items-center">
                  <span>已接收字符</span>
                  <span class="text-gray-900 dark:text-gray-200 font-semibold">{{ streamingContent.length }}</span>
                </div>
              </div>
            </div>

            <!-- 提示卡片 -->
            <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
              <p class="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                <strong>温馨提示：</strong>请保持页面开启，AI正在为您定制专属计划...
              </p>
            </div>

            <!-- 操作按钮 -->
            <div class="space-y-2">
              <button 
                class="btn btn-primary w-full justify-center opacity-50 cursor-not-allowed text-sm"
                disabled
              >
                <span class="flex items-center">
                  <ArrowPathIcon class="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </span>
              </button>
              
              <button @click="step = 2" class="btn btn-secondary w-full justify-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700 text-sm">
                取消并返回
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 计划确认视图 -->
      <div v-else class="card card-body rounded-md shadow-none border-0">
        <div class="flex items-center justify-between mb-6">
          <h2 class="section-title text-xl flex items-center mb-0">
            <ClipboardDocumentListIcon class="w-7 h-7 mr-2 text-primary-600 dark:text-primary-400" />
            确认计划
          </h2>
          <button 
            v-if="aiSuggestion"
            @click="showAiSuggestion = !showAiSuggestion"
            class="text-sm text-primary-600 dark:text-primary-400 flex items-center hover:underline bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded transition-colors"
          >
            <SparklesIcon class="w-4 h-4 mr-1" />
            {{ showAiSuggestion ? '收起 AI 原始建议' : '查看 AI 原始建议' }}
          </button>
        </div>

        <!-- AI 原始建议展示区 -->
        <div v-if="showAiSuggestion && aiSuggestion" class="mb-6 animate-fade-in-down">
          <div class="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center text-base">
                <CpuChipIcon class="w-5 h-5 mr-2" />
                AI 原始生成内容
              </h3>
              <span class="text-xs text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
                仅供参考，请在下方手动完善计划
              </span>
            </div>
            <div class="prose dark:prose-invert max-w-none text-sm font-mono whitespace-pre-wrap text-gray-600 dark:text-gray-400 max-h-[400px] overflow-y-auto custom-scrollbar">
              {{ aiSuggestion }}
            </div>
          </div>
        </div>

        <div v-if="generatedPlan" class="space-y-6">
          
          <!-- 时间线总览卡片 -->
          <div class="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
            <div class="flex items-start gap-8">
              <!-- 左侧：时间信息 -->
              <div class="flex-shrink-0" style="width: 400px;">
                <h3 class="font-bold text-gray-900 dark:text-white text-base mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  时间线总览
                </h3>
                <div class="space-y-3">
                  <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">开始日期</div>
                    <div class="text-base font-semibold text-gray-900 dark:text-white">{{ formatDate(new Date()) }}</div>
                  </div>
                  <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {{ goalData.goalNature === 'staged' ? '截止日期' : '目标性质' }}
                    </div>
                    <div class="text-base font-semibold text-gray-900 dark:text-white">
                      {{ getEndDateDisplay() }}
                    </div>
                  </div>
                  <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">计划周期</div>
                    <div class="text-lg font-bold text-primary-600 dark:text-primary-400">{{ getTotalWeeks() }} 周</div>
                  </div>
                </div>
              </div>
              
              <!-- 右侧：阶段分布 -->
              <div v-if="generatedPlan.stages && generatedPlan.stages.length > 0" class="flex-1 border-l border-primary-200 dark:border-primary-800 pl-8">
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">阶段分布总览</div>
                <div class="grid grid-cols-2 gap-3">
                  <div 
                    v-for="(stage, index) in generatedPlan.stages"
                    :key="index"
                    class="bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    @click="scrollToStage(index)"
                  >
                    <div class="flex items-start gap-3">
                      <div class="flex items-center justify-center w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold text-sm flex-shrink-0">
                        {{ index + 1 }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-semibold text-gray-900 dark:text-white text-sm truncate">{{ stage.name }}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">第 {{ stage.startWeek }}-{{ stage.endWeek }} 周 ({{ stage.endWeek - stage.startWeek + 1 }}周)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 层次化的阶段+周任务展示 -->
          <div v-if="generatedPlan.stages && generatedPlan.stages.length > 0" class="space-y-5">
            <div class="flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10 py-3 -mt-3">
              <h3 class="font-bold text-gray-900 dark:text-white text-base">详细规划</h3>
              <div class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <LightBulbIcon class="w-4 h-4 mr-1" /> 点击文字即可直接修改
              </div>
            </div>
            
            <!-- 阶段列表 -->
            <div class="space-y-6">
              <div
                v-for="(stage, stageIndex) in generatedPlan.stages"
                :key="stageIndex"
                :ref="el => setStageRef(el, stageIndex)"
                class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
              >
                <!-- 阶段头部 (可折叠) -->
                <div 
                  @click="toggleStage(stageIndex)"
                  class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 p-5 cursor-pointer hover:from-primary-50 hover:to-blue-50 dark:hover:from-primary-900/20 dark:hover:to-blue-900/20 transition-colors border-b border-gray-200 dark:border-gray-700"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center flex-1">
                      <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold mr-4 text-base">
                        {{ stageIndex + 1 }}
                      </div>
                      <div class="flex-1">
                        <input
                          v-model="stage.name"
                          @click.stop
                          class="font-bold text-lg text-gray-900 dark:text-white bg-transparent border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 rounded-sm px-2 py-1 outline-none transition-all w-full"
                          placeholder="阶段名称"
                        />
                        <div class="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span class="mr-4">第 {{ stage.startWeek }} - {{ stage.endWeek }} 周</span>
                          <span class="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded text-xs font-medium">共 {{ stage.endWeek - stage.startWeek + 1 }} 周</span>
                        </div>
                      </div>
                    </div>
                    <button class="ml-4 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors">
                      <svg 
                        class="w-6 h-6 text-gray-500 dark:text-gray-400 transition-transform"
                        :class="{ 'rotate-180': expandedStages[stageIndex] }"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <!-- 阶段内容（可折叠） -->
                <div v-show="expandedStages[stageIndex]" class="bg-white dark:bg-gray-800">
                  <!-- 左右分栏布局 -->
                  <div class="grid grid-cols-12 gap-6 p-6">
                    <!-- 左侧：阶段信息 (30%) -->
                    <div class="col-span-4 space-y-5">
                      <!-- 阶段描述 -->
                      <div>
                        <label class="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">阶段描述</label>
                        <textarea
                          v-model="stage.description"
                          class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-colors resize-none text-base leading-relaxed"
                          rows="4"
                          placeholder="描述本阶段的重点和目标..."
                        ></textarea>
                      </div>
                      
                      <!-- 阶段目标列表 -->
                      <div v-if="stage.goals && stage.goals.length > 0">
                        <label class="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">阶段目标</label>
                        <div class="space-y-3">
                          <div 
                            v-for="(goal, goalIndex) in stage.goals"
                            :key="goalIndex"
                            class="flex items-start group"
                          >
                            <span class="text-primary-500 mr-2 mt-1 text-base">▪</span>
                            <input
                              v-model="stage.goals[goalIndex]"
                              class="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 rounded transition-colors text-gray-700 dark:text-gray-300 text-base outline-none leading-relaxed"
                              placeholder="输入阶段目标..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 右侧：周任务 (70%) -->
                    <div class="col-span-8">
                      <label class="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">周任务计划</label>
                      <div class="grid grid-cols-2 gap-4">
                        <div
                          v-for="weekTask in getWeeksForStage(stage)"
                          :key="weekTask.week"
                          class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                        >
                          <!-- 周标题 -->
                          <div class="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <div class="font-bold text-gray-900 dark:text-white text-lg mb-2">第 {{ weekTask.week }} 周</div>
                            <input 
                              v-model="weekTask.focus"
                              class="w-full bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 rounded-sm px-2 py-1.5 outline-none transition-all text-gray-700 dark:text-gray-300 text-base"
                              placeholder="输入本周重点"
                            />
                          </div>
                          
                          <!-- 每日任务 -->
                          <div v-if="weekTask.dailyTasks && weekTask.dailyTasks.length > 0" class="space-y-4">
                            <div
                              v-for="(dailyTask, dayIndex) in weekTask.dailyTasks"
                              :key="dayIndex"
                              class="group"
                            >
                              <div class="flex items-center mb-2.5">
                                <input 
                                  v-model="dailyTask.dayName"
                                  class="font-semibold text-gray-800 dark:text-gray-200 w-16 bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 rounded-sm px-1 outline-none text-center text-base"
                                />
                                <div class="flex items-center text-base text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded ml-2">
                                  <input
                                    v-model="dailyTask.estimatedTime"
                                    type="number"
                                    class="w-12 text-center bg-transparent outline-none text-gray-700 dark:text-gray-300"
                                  />
                                  <span class="ml-1">min</span>
                                </div>
                              </div>
                              
                              <!-- 任务列表 -->
                              <div class="space-y-2 pl-2 text-base">
                                <div
                                  v-for="(task, taskIndex) in dailyTask.tasks"
                                  :key="taskIndex"
                                  class="group/task flex items-start"
                                >
                                  <span class="text-primary-400 mr-2 mt-1 text-lg">•</span>
                                  <input
                                    v-model="dailyTask.tasks[taskIndex]"
                                    type="text"
                                    class="flex-1 px-2 py-1.5 bg-transparent border-b border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 rounded-sm transition-colors text-gray-700 dark:text-gray-300 outline-none w-full leading-relaxed"
                                    placeholder="任务..."
                                  />
                                  <button
                                    @click="removeTaskFromDay(getWeekIndex(weekTask.week), dayIndex, taskIndex)"
                                    class="ml-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover/task:opacity-100 transition-opacity"
                                    title="删除"
                                  >
                                    <XMarkIcon class="w-5 h-5" />
                                  </button>
                                </div>
                                
                                <!-- 添加任务按钮 -->
                                <button
                                  @click="addTaskToDay(getWeekIndex(weekTask.week), dayIndex)"
                                  class="text-base text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 flex items-center ml-4 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <PlusIcon class="w-4 h-4 mr-1" /> 添加
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <!-- 没有详细任务的周 -->
                          <div v-else class="p-2 bg-white dark:bg-gray-800 rounded border border-dashed border-gray-300 dark:border-gray-600 text-center">
                            <button 
                              @click="weekTask.dailyTasks = generateDefaultDailyTasks(weekTask.week)"
                              class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline text-xs"
                            >
                              + 生成每日任务
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 如果没有阶段规划，展示扁平的周任务列表 -->
          <div v-else-if="generatedPlan.weeklyTasks && generatedPlan.weeklyTasks.length > 0" class="space-y-4">
            <h3 class="font-bold text-gray-900 dark:text-white text-base">周任务计划</h3>
            <div class="text-sm text-gray-500 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
              提示：建议为您的目标添加阶段规划，以便更好地组织和管理任务。
            </div>
            <!-- 这里可以保留原来的扁平展示逻辑作为后备方案 -->
          </div>
          
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
            <p class="text-sm text-blue-800 dark:text-blue-200">
              <strong>提示：</strong>计划已生成！点击任意内容即可修改，确认无误后点击下方按钮创建目标。
            </p>
          </div>
        </div>
      </div>
      
      <div v-if="!generating" class="flex justify-between pb-20 md:pb-4 px-6">
        <button @click="step = 2" class="btn btn-secondary rounded-sm">
          上一步
        </button>
        <button
          @click="createGoal"
          :disabled="creating"
          class="btn btn-success btn-lg rounded-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center"
        >
          <span v-if="creating">创建中...</span>
          <span v-else class="flex items-center"><CheckIcon class="w-5 h-5 mr-1" /> 确认并创建</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGoalsStore } from '@/stores/goals'
import { useUserStore } from '@/stores/user'
import { analyzeGoal, generatePlan as generatePlanAPI, generatePlanStream } from '@/config/deepseek'
import { supabase } from '@/config/supabase'
import Tesseract from 'tesseract.js'
import { 
    LightBulbIcon, 
    CheckIcon,
    SparklesIcon,
    ClipboardDocumentListIcon,
    XMarkIcon,
    PlusIcon,
    TrashIcon,
    ArrowPathIcon,
    CpuChipIcon,
    ArrowUpTrayIcon,
    AcademicCapIcon,
    HeartIcon,
    FlagIcon
  } from '@heroicons/vue/24/outline'

const router = useRouter()
const goalsStore = useGoalsStore()
const userStore = useUserStore()

// 进度保存的 key
const PROGRESS_KEY = 'goal_creation_progress'

// 文件解析状态
const isReadingFile = ref(false)

// 恢复进度提示
const showRestorePrompt = ref(false)
const savedProgress = ref(null)

// 处理学习类文件上传
async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  await processFile(file, (text) => {
    const prefix = userAnswers.value.customPlan ? '\n\n' : ''
    userAnswers.value.customPlan = (userAnswers.value.customPlan || '') + prefix + `[从文件 ${file.name} 提取的内容]:\n${text}`
  })
  
  // 清空input以允许重复上传同名文件
  event.target.value = ''
}

// 处理健康类文件上传
async function handleHealthFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  await processFile(file, (text) => {
    const prefix = healthConfig.value.customPlan ? '\n\n' : ''
    healthConfig.value.customPlan = (healthConfig.value.customPlan || '') + prefix + `[从文件 ${file.name} 提取的内容]:\n${text}`
  })
  
  // 清空input以允许重复上传同名文件
  event.target.value = ''
}

// 通用文件处理逻辑
async function processFile(file, callback) {
  isReadingFile.value = true
  try {
    let text = ''
    
    if (file.type.startsWith('image/')) {
      // 图片 OCR
      const result = await Tesseract.recognize(
        file,
        'chi_sim+eng', // 支持中英文
        { logger: m => console.log(m) }
      )
      text = result.data.text
    } else if (file.type === 'text/plain' || file.name.endsWith('.md')) {
      // 文本文件读取
      text = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(e)
        reader.readAsText(file)
      })
    } else {
      alert('暂不支持该文件格式，请上传图片或TXT/Markdown文档')
      return
    }
    
    if (text.trim()) {
      callback(text)
    } else {
      alert('未能从文件中识别出文字')
    }
  } catch (error) {
    console.error('文件解析失败:', error)
    alert('文件解析失败: ' + error.message)
  } finally {
    isReadingFile.value = false
  }
}

// 检查AI功能是否启用
async function checkAIEnabled() {
  try {
    const { data, error } = await supabase
      .from('system_configs')
      .select('value')
      .eq('key', 'deepseek_api_enabled')
      .single()
    
    if (error) return true // 默认启用
    return data?.value === 'true' || data?.value === true
  } catch (error) {
    return true // 默认启用
  }
}

const step = ref(1)
const steps = ['输入目标', '填写详情', '确认计划']

const goalData = ref({
  title: '',
  type: '',
  sub_type: '',
  strict_level: '标准',
  goalNature: '' // 'continuous' 持续性习惯 或 'staged' 阶段性目标
})

const userAnswers = ref({
  examDate: '',
  currentLevel: '',
  dailyTime: 60,
  weakPoints: ''
})

const healthConfig = ref({
  targetSleepTime: '23:00',
  targetWakeTime: '07:00',
  targetSleepHours: 8,
  targetWaterCups: 8,
  startWeight: null,
  targetWeight: null,
  targetDate: ''
})

const strictLevelDesc = {
  '严格': '不可修改计划',
  '标准': '可小幅调整',
  '弹性': '灵活调整'
}

const aiSuggestion = ref(null)
const showAiSuggestion = ref(false)
const generatedPlan = ref(null)

const analyzing = ref(false)
const generating = ref(false)
const creating = ref(false)

// 分析进度相关
const analyzingProgress = ref(0)
const analyzingStage = ref(0)

// 生成进度相关
const generatingProgress = ref(0)
const generatingStage = ref(0)
const streamingContent = ref('') // 流式显示的AI生成内容
const streamingContainer = ref(null) // 滚动容器

// 阶段展开/折叠状态
const expandedStages = ref({})

// 阶段ref引用
const stageRefs = ref({})

// 监听流式内容变化，自动滚动到底部
watch(streamingContent, async () => {
  await nextTick()
  if (streamingContainer.value) {
    streamingContainer.value.scrollTop = streamingContainer.value.scrollHeight
  }
})

// 监听生成的计划，默认展开所有阶段
watch(generatedPlan, (newPlan) => {
  if (newPlan && newPlan.stages) {
    const expanded = {}
    newPlan.stages.forEach((_, index) => {
      expanded[index] = true // 默认全部展开
    })
    expandedStages.value = expanded
  }
}, { immediate: true })

// ===== 进度保存与恢复功能 =====

// 保存当前进度
function saveProgress(stage = 'filling_details') {
  const progress = {
    timestamp: Date.now(),
    stage, // 当前阶段：'select_type', 'filling_details', 'generating', 'confirming'
    goalData: goalData.value,
    userAnswers: userAnswers.value,
    healthConfig: healthConfig.value,
    generatedPlan: generatedPlan.value,
    currentStep: step.value
  }
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  console.log('📁 进度已保存:', stage)
}

// 恢复进度
function restoreProgress(progress) {
  if (!progress) return false
  
  goalData.value = progress.goalData || goalData.value
  userAnswers.value = progress.userAnswers || userAnswers.value
  healthConfig.value = progress.healthConfig || healthConfig.value
  generatedPlan.value = progress.generatedPlan || null
  step.value = progress.currentStep || 1
  
  console.log('📂 进度已恢复:', progress.stage)
  return true
}

// 清除保存的进度
function clearProgress() {
  localStorage.removeItem(PROGRESS_KEY)
  savedProgress.value = null
  showRestorePrompt.value = false
  console.log('🗑️ 进度已清除')
}

// 恢复之前保存的进度
function acceptRestore() {
  if (savedProgress.value) {
    restoreProgress(savedProgress.value)
    clearProgress()
  }
}

// 拒绝恢复，清除旧进度
function rejectRestore() {
  clearProgress()
}

// 页面加载时检查是否有保存的进度
onMounted(() => {
  const saved = localStorage.getItem(PROGRESS_KEY)
  if (saved) {
    try {
      const progress = JSON.parse(saved)
      // 检查是否是24小时内的进度
      const hoursPassed = (Date.now() - progress.timestamp) / (1000 * 60 * 60)
      if (hoursPassed < 24 && progress.stage !== 'completed') {
        savedProgress.value = progress
        showRestorePrompt.value = true
      } else {
        // 超过24小时或已完成的进度，清除
        localStorage.removeItem(PROGRESS_KEY)
      }
    } catch (e) {
      console.error('解析保存的进度失败:', e)
      localStorage.removeItem(PROGRESS_KEY)
    }
  }
})

// 页面卸载时保存进度（如果还在进行中）
onUnmounted(() => {
  // 只在未完成时保存
  if (step.value < 3 || generating.value) {
    saveProgress(generating.value ? 'generating' : 'filling_details')
  }
})

// 监听步骤变化，自动保存
watch(step, (newStep) => {
  if (newStep === 1) {
    saveProgress('select_type')
  } else if (newStep === 2) {
    saveProgress('filling_details')
  } else if (newStep === 3 && generatedPlan.value) {
    saveProgress('confirming')
  }
})

// ===== 进度保存与恢复功能结束 =====

const canProceedStep1 = computed(() => {
  return goalData.value.title.trim() && goalData.value.type
})

const canProceedStep3 = computed(() => {
  // 必须选择目标性质
  if (!goalData.value.goalNature) return false
  
  if (goalData.value.type === '学习类') {
    // 如果是阶段性目标，必须填写截止日期
    if (goalData.value.goalNature === 'staged' && !userAnswers.value.examDate) {
      return false
    }
    return goalData.value.strict_level
  } else if (goalData.value.type === '健康类') {
    // 必须选择具体类型
    if (!goalData.value.sub_type) return false
    
    // 如果是阶段性目标，必须填写目标日期
    if (goalData.value.goalNature === 'staged' && 
        !healthConfig.value.targetDate) {
      return false
    }
    
    return goalData.value.strict_level
  }
  return false
})

function goToDetailStep() {
  if (!canProceedStep1.value) return
  step.value = 2
}

// 跳过AI生成计划，手动编写
function skipPlanGeneration() {
  if (!canProceedStep3.value) return
  
  // 生成一个基础的空白计划模板
  generatedPlan.value = generateBasicPlan()
  
  // 进入步骤3，用户可以手动编辑
  step.value = 3
  window.scrollTo(0, 0)
}

async function generatePlan() {
  if (!canProceedStep3.value) return
  
  // 检查AI功能是否启用
  const aiEnabled = await checkAIEnabled()
  if (!aiEnabled) {
    if (confirm('AI功能已被管理员禁用。\n\n是否使用基础计划模板？')) {
      generatedPlan.value = generateBasicPlan()
      step.value = 3
      window.scrollTo(0, 0)
    }
    return
  }
  
  generating.value = true
  step.value = 3 // 立即跳转到步骤3
  window.scrollTo(0, 0)
  streamingContent.value = ''
  
  try {
    // 准备答案数据，合并目标性质和执行严格度
    const answers = {
      ...(goalData.value.type === '学习类' ? userAnswers.value : healthConfig.value),
      goalNature: goalData.value.goalNature,
      strict_level: goalData.value.strict_level
    }
    
    // 使用流式API生成计划
    const result = await generatePlanStream(
      goalData.value.title, 
      goalData.value.type, 
      answers,
      // 流式回调函数：实时更新显示内容
      (chunk, fullContent) => {
        streamingContent.value = fullContent
      }
    )
    
    if (result.success) {
      await new Promise(resolve => setTimeout(resolve, 500))
      generatedPlan.value = result.data
      
      // 如果发生回退，提示用户
      if (result.isFallback) {
        // 自动展开AI建议，方便用户对照
        showAiSuggestion.value = true
        // alert('AI生成的计划格式可能有误，已为您切换到基础模板。您可以参考上方的"AI原始建议"手动完善计划。')
      }
      
      step.value = 3
    } else {
      // AI失败时使用基础计划
      alert('AI计划生成失败，使用基础计划模板')
      generatedPlan.value = generateBasicPlan()
      step.value = 3
    }
  } catch (error) {
    console.error('计划生成出错:', error)
    alert('计划生成出错，使用基础计划模板')
    generatedPlan.value = generateBasicPlan()
    step.value = 3
  } finally {
    // 保存AI生成的内容作为建议
    if (streamingContent.value) {
      aiSuggestion.value = streamingContent.value
    }
    
    generating.value = false
    streamingContent.value = ''
  }
}

function generateBasicPlan() {
  // 计算总周数
  let totalWeeks = 4 // 默认4周
  if (goalData.value.goalNature === 'staged' && userAnswers.value.examDate) {
    const startDate = new Date()
    const endDate = new Date(userAnswers.value.examDate)
    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    totalWeeks = Math.max(1, Math.ceil(diffDays / 7))
  } else if (goalData.value.goalNature === 'staged' && healthConfig.value.targetDate) {
    const startDate = new Date()
    const endDate = new Date(healthConfig.value.targetDate)
    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    totalWeeks = Math.max(1, Math.ceil(diffDays / 7))
  }
  
  // 限制最大周数
  totalWeeks = Math.min(totalWeeks, 52) // 最多52周
  
  if (goalData.value.type === '学习类') {
    // 持续性习惯：只需要通用的日任务模板，不需要详细的每日计划
    if (goalData.value.goalNature === 'continuous') {
      return {
        stages: [
          {
            name: '持续学习阶段',
            startWeek: 1,
            endWeek: totalWeeks,
            description: '每日坚持学习，灵活调整内容',
            goals: ['养成学习习惯', '持续进步']
          }
        ],
        weeklyTasks: [], // 持续性任务不需要预设周计划
        dailyTaskTemplate: {
          taskName: '每日学习',
          target: userAnswers.value.dailyTime || 60,
          unit: '分钟',
          estimatedTime: userAnswers.value.dailyTime || 60,
          description: '根据实际情况灵活安排每日学习内容'
        },
        flexibleMode: true // 标记为灵活模式
      }
    }
    
    // 阶段性目标：生成详细的每周和每日任务
    const weeklyTasks = []
    for (let week = 1; week <= totalWeeks; week++) {
      const dailyTasks = []
      for (let day = 1; day <= 7; day++) {
        dailyTasks.push({
          day: day,
          tasks: ['请编辑每日任务'],
          emphasis: ''
        })
      }
      
      weeklyTasks.push({
        week: week,
        focus: `第${week}周学习重点（请编辑）`,
        dailyTasks: dailyTasks
      })
    }
    
    return {
      stages: [
        {
          name: '第1阶段（请编辑阶段名称）',
          startWeek: 1,
          endWeek: Math.min(4, totalWeeks),
          description: '请编辑阶段描述',
          goals: ['请编辑阶段目标']
        }
      ],
      weeklyTasks: weeklyTasks,
      dailyTaskTemplate: {
        taskName: '每日学习',
        target: userAnswers.value.dailyTime || 60,
        unit: '分钟',
        estimatedTime: userAnswers.value.dailyTime || 60,
        description: '根据计划完成学习任务，持之以恒'
      },
      flexibleMode: false
    }
  } else {
    // 健康类
    
    // 持续性习惯：只需要通用的日任务模板
    if (goalData.value.goalNature === 'continuous') {
      return {
        stages: [
          {
            name: '养成习惯阶段',
            startWeek: 1,
            endWeek: totalWeeks,
            description: '通过持续打卡养成健康习惯',
            goals: ['坚持每日打卡', '达成目标']
          }
        ],
        weeklyTasks: [], // 健康类不需要预设周计划
        dailyTaskTemplate: {
          taskName: `每日${goalData.value.sub_type}打卡`,
          target: 1,
          unit: '次',
          estimatedTime: 5,
          description: '坚持每天完成并记录'
        },
        flexibleMode: true // 标记为灵活模式
      }
    }
    
    // 阶段性目标（健康类）：生成周计划结构
    const weeklyTasks = []
    for (let week = 1; week <= totalWeeks; week++) {
      const dailyTasks = []
      for (let day = 1; day <= 7; day++) {
        dailyTasks.push({
          day: day,
          tasks: [`完成本日${goalData.value.sub_type}目标`],
          emphasis: ''
        })
      }
      
      weeklyTasks.push({
        week: week,
        focus: `第${week}周${goalData.value.sub_type}重点（请编辑）`,
        dailyTasks: dailyTasks
      })
    }
    
    return {
      stages: [
        {
          name: '第1阶段（请编辑阶段名称）',
          startWeek: 1,
          endWeek: Math.min(4, totalWeeks),
          description: '循序渐进达成健康目标',
          goals: ['请编辑阶段目标']
        }
      ],
      weeklyTasks: weeklyTasks,
      dailyTaskTemplate: {
        taskName: `每日${goalData.value.sub_type}`,
        target: 1,
        unit: '次',
        estimatedTime: 15,
        description: '按计划完成健康任务'
      },
      flexibleMode: false
    }
  }
}

// 生成默认的每日任务
function generateDefaultDailyTasks(weekNumber) {
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return dayNames.map((dayName, index) => ({
    day: index + 1,
    dayName: dayName,
    tasks: ['完成本日学习任务', '保持每日打卡'],
    estimatedTime: 60,
    emphasis: '按计划完成'
  }))
}

// 添加任务到某一天
function addTaskToDay(weekIndex, dayIndex) {
  const dailyTask = generatedPlan.value.weeklyTasks[weekIndex].dailyTasks[dayIndex]
  if (dailyTask.tasks) {
    dailyTask.tasks.push('新任务')
  } else {
    dailyTask.tasks = ['新任务']
  }
}

// 从某一天删除任务
function removeTaskFromDay(weekIndex, dayIndex, taskIndex) {
  const dailyTask = generatedPlan.value.weeklyTasks[weekIndex].dailyTasks[dayIndex]
  if (dailyTask.tasks && dailyTask.tasks.length > 1) {
    dailyTask.tasks.splice(taskIndex, 1)
  } else {
    alert('至少保留一个任务')
  }
}

// 切换阶段的展开/折叠状态
function toggleStage(stageIndex) {
  expandedStages.value[stageIndex] = !expandedStages.value[stageIndex]
}

// 获取某个阶段的所有周任务
function getWeeksForStage(stage) {
  if (!generatedPlan.value.weeklyTasks) return []
  return generatedPlan.value.weeklyTasks.filter(
    week => week.week >= stage.startWeek && week.week <= stage.endWeek
  )
}

// 根据周数获取在 weeklyTasks 数组中的索引
function getWeekIndex(weekNumber) {
  if (!generatedPlan.value.weeklyTasks) return -1
  return generatedPlan.value.weeklyTasks.findIndex(w => w.week === weekNumber)
}

// 格式化日期
function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

// 获取结束日期显示
function getEndDateDisplay() {
  if (goalData.value.goalNature === 'staged') {
    if (goalData.value.type === '学习类' && userAnswers.value.examDate) {
      return formatDate(userAnswers.value.examDate)
    } else if (goalData.value.type === '健康类' && healthConfig.value.targetDate) {
      return formatDate(healthConfig.value.targetDate)
    }
    return '未设置'
  } else {
    return '持续性习惯'
  }
}

// 获取总周数
function getTotalWeeks() {
  if (goalData.value.goalNature === 'staged') {
    let endDateStr = null
    if (goalData.value.type === '学习类') {
      endDateStr = userAnswers.value.examDate
    } else if (goalData.value.type === '健康类') {
      endDateStr = healthConfig.value.targetDate
    }
    
    if (endDateStr) {
      const endDate = new Date(endDateStr)
      const today = new Date()
      const diffTime = endDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return Math.max(1, Math.ceil(diffDays / 7))
    }
  }
  
  // 如果是持续性习惯或没有设置日期，从计划中计算
  if (generatedPlan.value?.weeklyTasks?.length > 0) {
    return Math.max(...generatedPlan.value.weeklyTasks.map(w => w.week))
  }
  
  return 4 // 默认4周
}

// 设置阶段ref
function setStageRef(el, index) {
  if (el) {
    stageRefs.value[index] = el
  }
}

// 滚动到指定阶段
function scrollToStage(index) {
  const stageEl = stageRefs.value[index]
  if (stageEl) {
    stageEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // 确保该阶段是展开的
    expandedStages.value[index] = true
  }
}

async function createGoal() {
  creating.value = true
  try {
    // 根据目标性质决定截止日期
    let endDate = null
    if (goalData.value.goalNature === 'staged') {
      // 阶段性目标：有截止日期
      if (goalData.value.type === '学习类') {
        endDate = userAnswers.value.examDate
      } else if (goalData.value.type === '健康类') {
        endDate = healthConfig.value.targetDate
      }
    }
    // 持续性习惯：end_date 为 null
    
    const newGoal = {
      user_id: userStore.user.id,
      title: goalData.value.title,
      type: goalData.value.type,
      sub_type: goalData.value.sub_type,
      strict_level: goalData.value.strict_level,
      goal_nature: goalData.value.goalNature, // 新增：保存目标性质
      status: '进行中',
      ai_suggestion: aiSuggestion.value,
      user_answers: userAnswers.value,
      plan: generatedPlan.value,
      health_config: goalData.value.type === '健康类' ? healthConfig.value : null,
      start_date: new Date().toISOString().split('T')[0],
      end_date: endDate,
      progress: {
        percentage: 0,
        currentStage: 1,
        completedDays: 0
      },
      milestones: [
        { at: 25, title: '完成1/4', achieved: false },
        { at: 50, title: '完成一半', achieved: false },
        { at: 75, title: '完成3/4', achieved: false },
        { at: 100, title: '目标达成', achieved: false }
      ]
    }
    
    const result = await goalsStore.createGoal(newGoal)
    if (result.success) {
      router.push(`/app/goals/${result.data.id}`)
    } else {
      alert('创建失败：' + result.error)
    }
  } catch (error) {
    alert('创建出错：' + error.message)
  } finally {
    creating.value = false
  }
}
</script>

