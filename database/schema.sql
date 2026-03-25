-- 长期目标管理系统 - 数据库Schema
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 用户表（Supabase Auth自动创建，这里只是参考）
-- auth.users 已存在，我们只需要扩展用户设置

-- 2. 用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme VARCHAR(20) DEFAULT 'light',
  deepseek_api_key TEXT,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. 目标表
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 基本信息
  title VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 学习类/健康类
  sub_type VARCHAR(50), -- 考证/考试 | 睡眠/喝水/减肥/运动
  strict_level VARCHAR(20) DEFAULT '标准', -- 严格/标准/弹性
  status VARCHAR(20) DEFAULT '规划中', -- 想法/规划中/进行中/已暂停/已完成
  
  -- AI分析结果
  ai_suggestion JSONB, -- AI的建议（第一次分析）
  
  -- 用户回答
  user_answers JSONB, -- 用户回答的问题
  
  -- 计划（AI生成 + 用户修改）
  plan JSONB, -- { stages, weeklyTasks, dailyTasks }
  
  -- 进度
  progress JSONB DEFAULT '{"percentage": 0}'::jsonb, -- { percentage, currentStage, completedDays, totalDays }
  
  -- 里程碑
  milestones JSONB DEFAULT '[]'::jsonb, -- [{ at, title, achieved, achievedDate }]
  
  -- 健康类目标特有配置
  health_config JSONB, -- 睡眠/喝水/减肥等的具体配置
  
  -- 时间
  start_date DATE,
  end_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 打卡记录表
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  
  -- 打卡日期
  date DATE NOT NULL,
  
  -- 打卡状态
  status VARCHAR(20) NOT NULL, -- completed/partial/missed/paused
  
  -- 学习类打卡数据
  learning_data JSONB, -- { taskName, targetAmount, actualAmount, completionRate, timeSpent, notes }
  
  -- 健康类打卡数据
  health_data JSONB, -- { sleepTime, wakeTime, waterCups, weight, exercises, ... }
  
  -- 额外完成的任务
  extra_tasks TEXT[],
  
  -- 是否跨天打卡
  is_late_check_in BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保同一天同一目标只能打卡一次
  UNIQUE(goal_id, date)
);

-- 5. 想法收集箱表
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 类型
  type VARCHAR(20) NOT NULL, -- 新目标/资料链接
  
  -- 新目标草稿
  title VARCHAR(255),
  description TEXT,
  
  -- 资料链接
  link_title VARCHAR(255),
  link TEXT,
  notes TEXT,
  related_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  
  -- 状态
  status VARCHAR(20) DEFAULT 'pending', -- pending/converted
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 成就表（可选，用于后续扩展）
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL, -- 连续打卡/完成目标/学习时长等
  value INTEGER, -- 数值（如30天）
  data JSONB, -- 其他数据
  
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_check_ins_goal_id ON check_ins(goal_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(date);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_date ON check_ins(user_id, date);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);

-- 启用行级安全策略 (RLS)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略：用户只能访问自己的数据

-- user_settings 策略
CREATE POLICY "用户只能查看自己的设置" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能插入自己的设置" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户只能更新自己的设置" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- goals 策略
CREATE POLICY "用户只能查看自己的目标" ON goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能创建自己的目标" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户只能更新自己的目标" ON goals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用户只能删除自己的目标" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- check_ins 策略
CREATE POLICY "用户只能查看自己的打卡记录" ON check_ins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能创建自己的打卡记录" ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户只能更新自己的打卡记录" ON check_ins
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用户只能删除自己的打卡记录" ON check_ins
  FOR DELETE USING (auth.uid() = user_id);

-- ideas 策略
CREATE POLICY "用户只能查看自己的想法" ON ideas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能创建自己的想法" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户只能更新自己的想法" ON ideas
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用户只能删除自己的想法" ON ideas
  FOR DELETE USING (auth.uid() = user_id);

-- achievements 策略
CREATE POLICY "用户只能查看自己的成就" ON achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能创建自己的成就" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建更新时间的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完成！
-- 执行此脚本后，你的数据库就配置好了

