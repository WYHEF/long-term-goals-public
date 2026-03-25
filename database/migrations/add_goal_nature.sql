-- 添加 goal_nature 字段到 goals 表
-- 用于区分"持续性习惯"和"阶段性目标"

ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS goal_nature VARCHAR(20) DEFAULT 'staged';

COMMENT ON COLUMN goals.goal_nature IS '目标性质: continuous(持续性习惯) 或 staged(阶段性目标)';

-- 为已有数据设置默认值
-- 有 end_date 的设为 staged，没有的设为 continuous
UPDATE goals 
SET goal_nature = CASE 
  WHEN end_date IS NOT NULL THEN 'staged'
  ELSE 'continuous'
END
WHERE goal_nature IS NULL;

