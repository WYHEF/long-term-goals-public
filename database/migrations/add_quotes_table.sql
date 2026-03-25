-- 添加名言警句功能表
-- 执行日期: 2025-12-17

-- 创建 quotes 表
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 名言内容
  content TEXT NOT NULL,
  author VARCHAR(100), -- 作者/来源（可选）
  
  -- 是否启用
  is_active BOOLEAN DEFAULT true,
  
  -- 创建时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_is_active ON quotes(is_active);

-- 启用行级安全策略 (RLS)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略：用户只能访问自己的数据
CREATE POLICY "用户只能查看自己的名言" ON quotes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的名言" ON quotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的名言" ON quotes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的名言" ON quotes
  FOR DELETE USING (auth.uid() = user_id);

-- 创建更新时间触发器
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完成！

