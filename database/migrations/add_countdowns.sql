-- 创建倒数日表
CREATE TABLE IF NOT EXISTS countdowns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 基本信息
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- 时间
  target_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- 分类
  category VARCHAR(50) DEFAULT 'other', -- exam, birthday, anniversary, deadline, other
  
  -- 颜色标记
  color VARCHAR(20) DEFAULT 'blue', -- blue, red, green, yellow, purple
  
  -- 提醒设置
  remind_days_before INTEGER[], -- [7, 3, 1] 表示提前7天、3天、1天提醒
  
  -- 是否完成/过期后隐藏
  is_completed BOOLEAN DEFAULT false,
  hide_after_passed BOOLEAN DEFAULT false,
  
  -- 置顶
  is_pinned BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_countdowns_user_id ON countdowns(user_id);
CREATE INDEX IF NOT EXISTS idx_countdowns_target_date ON countdowns(target_date);
CREATE INDEX IF NOT EXISTS idx_countdowns_is_pinned ON countdowns(is_pinned);

-- RLS 策略
ALTER TABLE countdowns ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的倒数日
CREATE POLICY "Users can view own countdowns" ON countdowns
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建自己的倒数日
CREATE POLICY "Users can insert own countdowns" ON countdowns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的倒数日
CREATE POLICY "Users can update own countdowns" ON countdowns
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的倒数日
CREATE POLICY "Users can delete own countdowns" ON countdowns
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE countdowns IS '倒数日/重要日期提醒表';
COMMENT ON COLUMN countdowns.category IS '分类: exam(考试), birthday(生日), anniversary(纪念日), deadline(截止日期), other(其他)';
COMMENT ON COLUMN countdowns.remind_days_before IS '提前提醒天数数组，例如 [7, 3, 1] 表示提前7天、3天、1天提醒';

