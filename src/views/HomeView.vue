<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
    <!-- 导航栏 -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <img src="/assets/星煜凡程透明.png" alt="星煜凡程" class="h-10 w-auto" />
            <span class="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              星煜凡程
            </span>
          </div>
          
          <!-- 右侧按钮 -->
          <div class="flex items-center space-x-4">
            <!-- 主题切换按钮 -->
            <button
              @click="toggleTheme"
              class="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              :title="themeStore.theme === 'light' ? '切换到深色模式' : '切换到浅色模式'"
            >
              <MoonIcon v-if="themeStore.theme === 'light'" class="w-5 h-5" />
              <SunIcon v-else class="w-5 h-5" />
            </button>
            
            <!-- 未登录状态 -->
            <template v-if="!isLoggedIn">
              <router-link 
                to="/login"
                class="px-6 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                登录
              </router-link>
              <router-link 
                to="/login"
                class="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                开始使用
              </router-link>
            </template>
            
            <!-- 已登录状态 -->
            <template v-else>
              <router-link 
                to="/app/today"
                class="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>进入应用</span>
                <ArrowRightIcon class="w-4 h-4" />
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 -z-10">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div class="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div class="max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- 左侧文字 -->
          <div class="space-y-8">
            <div class="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
              <span class="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-wide">
                🚀 AI驱动的智能目标管理平台
              </span>
            </div>
            
            <h1 class="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
              <span class="text-gray-900 dark:text-white">凡程蓄力</span>
              <br />
              <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                星途煜辉
              </span>
            </h1>
            
            <p class="text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
              让长期目标也能获得及时反馈。通过AI智能规划与可视化追踪，
              <span class="font-bold text-gray-900 dark:text-white">将梦想拆解为可执行的每日任务</span>，
              见证每一步成长。
            </p>
            
            <div class="flex flex-wrap gap-4">
              <router-link 
                to="/login"
                class="group px-8 py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>立即开始</span>
                <ArrowRightIcon class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </router-link>
              
              <a 
                href="#features"
                class="px-8 py-4 text-lg font-bold text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-700 rounded-xl hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
              >
                了解更多
              </a>
            </div>
            
            <!-- 数据展示 -->
            <div class="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div>
                <div class="text-3xl font-black text-gray-900 dark:text-white">AI</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">智能规划</div>
              </div>
              <div>
                <div class="text-3xl font-black text-gray-900 dark:text-white">24/7</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">实时追踪</div>
              </div>
              <div>
                <div class="text-3xl font-black text-gray-900 dark:text-white">100%</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">免费使用</div>
              </div>
            </div>
          </div>
          
          <!-- 右侧图片 -->
          <div class="relative">
            <div class="relative z-10">
              <img 
                src="/assets/hero-screenshot.png" 
                alt="星煜凡程应用界面" 
                class="rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800"
              />
            </div>
            <!-- 装饰元素 -->
            <div class="absolute -bottom-8 -right-8 w-72 h-72 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl opacity-20 blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 核心功能展示 -->
    <section id="features" class="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            强大的功能，简单的体验
          </h2>
          <p class="text-xl text-gray-700 dark:text-gray-300">
            一站式解决长期目标管理的所有痛点
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- 功能卡片 1: AI智能规划 -->
          <div class="group bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <SparklesIcon class="w-7 h-7 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              AI智能规划
            </h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              基于DeepSeek大模型，自动将宏大目标拆解为具体可执行的任务，智能生成实现路径。
            </p>
          </div>
          
          <!-- 功能卡片 2: 目标管理 -->
          <div class="group bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ClipboardDocumentListIcon class="w-7 h-7 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              目标任务拆解
            </h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              清晰的目标层级，任务逐级拆解，每天都知道该做什么，让大目标不再遥不可及。
            </p>
          </div>
          
          <!-- 功能卡片 3: 可视化追踪 -->
          <div class="group bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ChartBarIcon class="w-7 h-7 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              打卡热力图
            </h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              GitHub风格的热力图，直观展示你的坚持与努力，每一格都是成长的足迹。
            </p>
          </div>
          
          <!-- 功能卡片 4: 数据统计 -->
          <div class="group bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <PresentationChartLineIcon class="w-7 h-7 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              数据分析
            </h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              多维度数据统计，趋势分析图表，让你清晰了解自己的进步曲线和薄弱环节。
            </p>
          </div>
          
          <!-- 功能卡片 5: 倒数日 -->
          <div class="group bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div class="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CalendarDaysIcon class="w-7 h-7 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              倒数日提醒
            </h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              重要日期倒计时，AI智能识别时间，让每个deadline都清晰可见，时刻保持紧迫感。
            </p>
          </div>
          
          <!-- 功能卡片 6: 想法收集箱 -->
          <div class="group bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-yellow-500 dark:hover:border-yellow-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div class="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <LightBulbIcon class="w-7 h-7 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              想法收集箱
            </h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              随时记录灵感和想法，不错过任何可能的目标，待时机成熟再转化为行动。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 使用场景 -->
    <section class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            适用于各种长期目标
          </h2>
          <p class="text-xl text-gray-700 dark:text-gray-300">
            无论你的梦想是什么，我们都能帮你实现
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-8">
          <!-- 场景 1 -->
          <div class="flex items-start space-x-6 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
            <div class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <AcademicCapIcon class="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                学业提升
              </h3>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                考研、考证、学语言？AI帮你制定科学的学习计划，每日打卡追踪进度，坚持就是胜利。
              </p>
            </div>
          </div>
          
          <!-- 场景 2 -->
          <div class="flex items-start space-x-6 p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-100 dark:border-green-800">
            <div class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <HeartIcon class="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                健康管理
              </h3>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                减肥、健身、早睡早起？用打卡热力图见证你的蜕变，让好习惯成为生活的一部分。
              </p>
            </div>
          </div>
          
          <!-- 场景 3 -->
          <div class="flex items-start space-x-6 p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-100 dark:border-purple-800">
            <div class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <BriefcaseIcon class="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                职业发展
              </h3>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                技能提升、项目开发、副业创收？清晰的任务拆解让复杂目标不再迷茫。
              </p>
            </div>
          </div>
          
          <!-- 场景 4 -->
          <div class="flex items-start space-x-6 p-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-100 dark:border-orange-800">
            <div class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
              <RocketLaunchIcon class="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                个人成长
              </h3>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                阅读计划、写作练习、技能学习？让每一个小目标都成为通往理想人生的阶梯。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能截图展示 -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            界面简洁，功能强大
          </h2>
          <p class="text-xl text-gray-700 dark:text-gray-300">
            现代化的设计，流畅的体验
          </p>
        </div>
        
        <div class="space-y-24">
          <!-- 截图 1: 目标管理 -->
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div class="space-y-6">
              <div class="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <span class="text-sm font-bold text-blue-600 dark:text-blue-400">目标管理</span>
              </div>
              <h3 class="text-3xl font-black text-gray-900 dark:text-white">
                清晰的目标层级
              </h3>
              <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                一目了然的目标卡片，快速了解每个目标的完成情况、连续打卡天数。支持不同目标性质标记，让管理更有序。
              </p>
              <div class="flex flex-wrap gap-3">
                <div class="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircleIcon class="w-5 h-5 text-green-500" />
                  <span>进度可视化</span>
                </div>
                <div class="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircleIcon class="w-5 h-5 text-green-500" />
                  <span>连续打卡统计</span>
                </div>
                <div class="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircleIcon class="w-5 h-5 text-green-500" />
                  <span>目标性质标记</span>
                </div>
              </div>
            </div>
            <div class="relative">
              <img 
                src="/assets/screenshots/goals-view.png" 
                alt="目标管理界面" 
                class="rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800"
              />
            </div>
          </div>
          
          <!-- 截图 2: 打卡热力图 -->
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div class="relative lg:order-1">
              <img 
                src="/assets/screenshots/heatmap-view.png" 
                alt="打卡热力图" 
                class="rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800"
              />
            </div>
            <div class="space-y-6 lg:order-2">
              <div class="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <span class="text-sm font-bold text-purple-600 dark:text-purple-400">数据可视化</span>
              </div>
              <h3 class="text-3xl font-black text-gray-900 dark:text-white">
                打卡热力图
              </h3>
              <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                GitHub风格的热力图，记录你的每一次坚持。不同颜色深浅代表打卡强度，让成长轨迹一目了然。
              </p>
              <div class="flex flex-wrap gap-3">
                <div class="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircleIcon class="w-5 h-5 text-green-500" />
                  <span>全年数据展示</span>
                </div>
                <div class="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircleIcon class="w-5 h-5 text-green-500" />
                  <span>连续天数统计</span>
                </div>
                <div class="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircleIcon class="w-5 h-5 text-green-500" />
                  <span>最长连续记录</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 截图 3: AI智能规划 -->
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div class="space-y-6">
              <div class="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <span class="text-sm font-bold text-green-600 dark:text-green-400">AI智能</span>
              </div>
              <h3 class="text-3xl font-black text-gray-900 dark:text-white">
                AI自动拆解任务
              </h3>
              <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                只需输入你的目标，DeepSeek AI会自动分析并生成详细的实施计划，将大目标拆解为可执行的小任务。
              </p>
              <div class="flex flex-wrap gap-3">
                <div class="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircleIcon class="w-5 h-5 text-green-500" />
                  <span>智能分析</span>
                </div>
                <div class="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircleIcon class="w-5 h-5 text-green-500" />
                  <span>自动拆解</span>
                </div>
                <div class="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircleIcon class="w-5 h-5 text-green-500" />
                  <span>可执行建议</span>
                </div>
              </div>
            </div>
            <div class="relative">
              <img 
                src="/assets/screenshots/ai-planning.png" 
                alt="AI智能规划" 
                class="rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            常见问题
          </h2>
          <p class="text-xl text-gray-700 dark:text-gray-300">
            快速了解星煜凡程
          </p>
        </div>
        
        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
              星煜凡程是完全免费的吗？
            </h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              是的！星煜凡程目前完全免费，包括AI智能规划在内的所有核心功能都可以无限制使用。
            </p>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
              我的数据安全吗？
            </h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              我们使用Supabase作为后端服务，数据经过加密存储，严格遵守隐私政策。您的目标和打卡数据完全私密，只有您自己能看到。
            </p>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
              AI功能是如何工作的？
            </h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              我们集成了DeepSeek大语言模型，当您创建新目标时，AI会根据目标内容智能生成实施计划和任务拆解建议，帮助您更好地规划实现路径。
            </p>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
              可以在手机上使用吗？
            </h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              当然可以！星煜凡程是响应式设计，完美适配手机、平板和电脑。您可以在任何设备上登录使用，数据实时同步。
            </p>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
              如何开始使用？
            </h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              非常简单！点击"开始使用"按钮，使用邮箱注册账号，然后就可以创建您的第一个目标了。AI会引导您完成目标设置和任务规划。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
      <!-- 背景装饰图案 -->
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMTAgMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
      
      <div class="max-w-4xl mx-auto text-center relative z-10">
        <h2 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6">
          开始你的目标达成之旅
        </h2>
        <p class="text-xl text-white/90 mb-10 leading-relaxed">
          无需信用卡，无需付费，现在注册即可使用所有功能
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <router-link 
            to="/login"
            class="group px-10 py-5 text-lg font-bold bg-white text-blue-600 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
          >
            <span>免费开始使用</span>
            <ArrowRightIcon class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </router-link>
        </div>
        
        <p class="mt-8 text-white/80 text-sm">
          已有账户？
          <router-link to="/login" class="font-bold text-white hover:underline">
            立即登录
          </router-link>
        </p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-black border-t border-gray-800">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div class="flex items-center space-x-3 mb-4">
              <img src="/assets/星煜凡程透明.png" alt="星煜凡程" class="h-8 w-auto" />
              <span class="text-lg font-black text-white">星煜凡程</span>
            </div>
            <p class="text-gray-400 text-sm leading-relaxed">
              AI驱动的智能目标管理平台<br />
              让长期目标也能获得及时反馈
            </p>
          </div>
          
          <div>
            <h3 class="text-white font-bold mb-4">产品</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#features" class="text-gray-400 hover:text-white transition-colors">功能介绍</a></li>
              <li><router-link to="/login" class="text-gray-400 hover:text-white transition-colors">开始使用</router-link></li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-white font-bold mb-4">法律信息</h3>
            <ul class="space-y-2 text-sm">
              <li><router-link to="/terms" class="text-gray-400 hover:text-white transition-colors">服务条款</router-link></li>
              <li><router-link to="/privacy" class="text-gray-400 hover:text-white transition-colors">隐私政策</router-link></li>
            </ul>
          </div>
        </div>
        
        <div class="pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>© 2026 星煜凡程. 凡程蓄力，星途煜辉.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import {
  SparklesIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  CalendarDaysIcon,
  LightBulbIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  HeartIcon,
  BriefcaseIcon,
  RocketLaunchIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/vue/24/outline'

const themeStore = useThemeStore()
const userStore = useUserStore()

// 检查用户是否已登录
const isLoggedIn = computed(() => !!userStore.user)

// 初始化时检查登录状态
onMounted(async () => {
  await userStore.initUser()
})

function toggleTheme() {
  themeStore.toggleTheme()
}
</script>

<style scoped>
/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}

/* 自定义动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>

