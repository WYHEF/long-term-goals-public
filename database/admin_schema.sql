-- 管理员系统 - 数据库Schema
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 管理员信息
  role VARCHAR(20) DEFAULT 'admin', -- admin/super_admin
  permissions JSONB DEFAULT '["view_users", "view_goals", "view_checkins", "view_stats"]'::jsonb,
  
  -- 状态
  is_active BOOLEAN DEFAULT true,
  
  -- 时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 2. 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES admins(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 系统公告表
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info', -- info/warning/success/error
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 管理员操作日志表
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 操作类型
  target_type VARCHAR(50), -- user/goal/checkin/system
  target_id UUID,
  details JSONB, -- 详细信息
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);

-- 启用行级安全策略
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- 创建管理员检查函数
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = auth.uid() 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 管理员表策略：只有管理员可以查看
CREATE POLICY "管理员可以查看所有管理员" ON admins
  FOR SELECT USING (is_admin());
CREATE POLICY "超级管理员可以插入管理员" ON admins
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "超级管理员可以更新管理员" ON admins
  FOR UPDATE USING (is_admin());

-- 系统配置策略：只有管理员可以访问
CREATE POLICY "管理员可以查看系统配置" ON system_configs
  FOR SELECT USING (is_admin());
CREATE POLICY "管理员可以更新系统配置" ON system_configs
  FOR UPDATE USING (is_admin());
CREATE POLICY "管理员可以插入系统配置" ON system_configs
  FOR INSERT WITH CHECK (is_admin());

-- 公告策略：管理员可以管理，所有用户可以查看
CREATE POLICY "所有用户可以查看活跃公告" ON announcements
  FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "管理员可以创建公告" ON announcements
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "管理员可以更新公告" ON announcements
  FOR UPDATE USING (is_admin());
CREATE POLICY "管理员可以删除公告" ON announcements
  FOR DELETE USING (is_admin());

-- 操作日志策略：只有管理员可以查看
CREATE POLICY "管理员可以查看操作日志" ON admin_logs
  FOR SELECT USING (is_admin());
CREATE POLICY "管理员可以创建操作日志" ON admin_logs
  FOR INSERT WITH CHECK (is_admin());

-- 修改原有表的策略，允许管理员查看所有数据
-- 注意：需要先删除原有策略，然后重新创建

-- goals 表：添加管理员查看权限
CREATE POLICY "管理员可以查看所有目标" ON goals
  FOR SELECT USING (is_admin());

-- check_ins 表：添加管理员查看权限
CREATE POLICY "管理员可以查看所有打卡记录" ON check_ins
  FOR SELECT USING (is_admin());

-- ideas 表：添加管理员查看权限
CREATE POLICY "管理员可以查看所有想法" ON ideas
  FOR SELECT USING (is_admin());

-- user_settings 表：添加管理员查看权限
CREATE POLICY "管理员可以查看所有用户设置" ON user_settings
  FOR SELECT USING (is_admin());

-- 创建更新时间触发器
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入初始系统配置
INSERT INTO system_configs (key, value, description) VALUES
  ('maintenance_mode', 'false', '系统维护模式'),
  ('allow_registration', 'true', '允许新用户注册'),
  ('max_goals_per_user', '50', '每个用户最多创建的目标数'),
  ('deepseek_api_enabled', 'true', 'DeepSeek AI功能是否启用')
ON CONFLICT (key) DO NOTHING;

-- 完成！
-- 执行此脚本后，需要手动将你的用户ID添加到admins表中
-- 示例：
-- INSERT INTO admins (user_id, role, permissions) 
-- VALUES ('你的用户UUID', 'super_admin', '["all"]'::jsonb);

