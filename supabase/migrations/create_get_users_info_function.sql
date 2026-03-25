-- 创建一个函数来获取用户的基本信息（邮箱、最后登录时间等）
-- 这个函数需要管理员权限才能访问 auth.users 表

CREATE OR REPLACE FUNCTION get_users_info(user_ids uuid[])
RETURNS TABLE (
  id uuid,
  email varchar,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER -- 使用函数定义者的权限执行
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::varchar,
    au.created_at,
    au.last_sign_in_at
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$;

-- 授予执行权限给认证用户
GRANT EXECUTE ON FUNCTION get_users_info(uuid[]) TO authenticated;

-- 添加注释
COMMENT ON FUNCTION get_users_info IS '获取指定用户ID列表的基本信息（邮箱、创建时间、最后登录时间）';
