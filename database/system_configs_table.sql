-- 创建系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_system_configs_key ON system_configs(key);

-- 插入默认配置
INSERT INTO system_configs (key, value, description) VALUES
  ('maintenance_mode', 'false', '维护模式开关'),
  ('allow_registration', 'true', '允许新用户注册'),
  ('deepseek_api_enabled', 'true', 'DeepSeek AI功能开关'),
  ('max_goals_per_user', '50', '每用户最大目标数')
ON CONFLICT (key) DO NOTHING;

-- 配置RLS策略
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;

-- 允许所有认证用户读取配置
CREATE POLICY "允许认证用户读取系统配置"
  ON system_configs
  FOR SELECT
  TO authenticated
  USING (true);

-- 只允许管理员修改配置
CREATE POLICY "只允许管理员修改系统配置"
  ON system_configs
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 添加注释
COMMENT ON TABLE system_configs IS '系统配置表';
COMMENT ON COLUMN system_configs.key IS '配置键（唯一）';
COMMENT ON COLUMN system_configs.value IS '配置值（字符串格式）';
COMMENT ON COLUMN system_configs.description IS '配置描述';
