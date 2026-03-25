-- 移除 check_ins 表的唯一约束，以支持累积打卡（如喝水、运动等）
-- 这样用户可以在同一天对同一个目标进行多次打卡

-- 删除现有的唯一约束
ALTER TABLE check_ins 
DROP CONSTRAINT IF EXISTS check_ins_goal_id_date_key;

-- 为了保持数据完整性，我们可以添加一个复合索引来优化查询性能
-- 但不设置为唯一约束
CREATE INDEX IF NOT EXISTS idx_check_ins_goal_date 
ON check_ins(goal_id, date);

-- 说明：
-- 1. 删除了 (goal_id, date) 的唯一约束
-- 2. 添加了普通索引以保持查询性能
-- 3. 现在允许同一个目标在同一天有多条打卡记录
-- 4. 这对于累积类型的健康目标（如喝水、运动）是必需的

