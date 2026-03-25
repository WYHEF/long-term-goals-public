-- 将博客功能升级为公开社区
-- 执行日期: 2026-01-07

-- blog_categories: 改为全站分类（公开可读）
ALTER TABLE blog_categories
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'blog_categories' AND column_name = 'user_id'
  ) THEN
    EXECUTE 'UPDATE blog_categories SET created_by = user_id WHERE created_by IS NULL AND user_id IS NOT NULL';
    EXECUTE 'ALTER TABLE blog_categories DROP CONSTRAINT IF EXISTS blog_categories_user_id_name_key';
    EXECUTE 'ALTER TABLE blog_categories DROP COLUMN IF EXISTS user_id';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'blog_categories_name_key'
  ) THEN
    EXECUTE 'ALTER TABLE blog_categories ADD CONSTRAINT blog_categories_name_key UNIQUE (name)';
  END IF;
END $$;

DROP INDEX IF EXISTS idx_blog_categories_user_id;

-- blog_posts: 改为作者字段 + 公开可读（已发布）
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS author_display_name TEXT,
ADD COLUMN IF NOT EXISTS author_avatar_path TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'user_id'
  ) THEN
    EXECUTE 'UPDATE blog_posts SET author_id = user_id WHERE author_id IS NULL AND user_id IS NOT NULL';
    EXECUTE 'ALTER TABLE blog_posts DROP COLUMN IF EXISTS user_id';
  END IF;
END $$;

UPDATE blog_posts
SET status = 'published'
WHERE status IS NULL;

UPDATE blog_posts
SET published_at = COALESCE(published_at, created_at)
WHERE status = 'published' AND published_at IS NULL;

ALTER TABLE blog_posts
ALTER COLUMN author_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);

-- 重建RLS策略
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "用户只能查看自己的博客分类" ON blog_categories;
DROP POLICY IF EXISTS "用户只能创建自己的博客分类" ON blog_categories;
DROP POLICY IF EXISTS "用户只能更新自己的博客分类" ON blog_categories;
DROP POLICY IF EXISTS "用户只能删除自己的博客分类" ON blog_categories;

DROP POLICY IF EXISTS "用户只能查看自己的博客文章" ON blog_posts;
DROP POLICY IF EXISTS "用户只能创建自己的博客文章" ON blog_posts;
DROP POLICY IF EXISTS "用户只能更新自己的博客文章" ON blog_posts;
DROP POLICY IF EXISTS "用户只能删除自己的博客文章" ON blog_posts;

DROP POLICY IF EXISTS "所有人可查看博客分类" ON blog_categories;
DROP POLICY IF EXISTS "登录用户可创建博客分类" ON blog_categories;
DROP POLICY IF EXISTS "管理员可更新博客分类" ON blog_categories;
DROP POLICY IF EXISTS "管理员可删除博客分类" ON blog_categories;

DROP POLICY IF EXISTS "所有人可查看博客文章" ON blog_posts;
DROP POLICY IF EXISTS "登录用户可创建博客文章" ON blog_posts;
DROP POLICY IF EXISTS "作者可更新博客文章" ON blog_posts;
DROP POLICY IF EXISTS "作者可删除博客文章" ON blog_posts;

CREATE POLICY "所有人可查看博客分类" ON blog_categories
  FOR SELECT USING (true);

CREATE POLICY "登录用户可创建博客分类" ON blog_categories
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "管理员可更新博客分类" ON blog_categories
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "管理员可删除博客分类" ON blog_categories
  FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "所有人可查看博客文章" ON blog_posts
  FOR SELECT USING (status = 'published' OR auth.uid() = author_id OR is_admin());

CREATE POLICY "登录用户可创建博客文章" ON blog_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id OR is_admin());

CREATE POLICY "作者可更新博客文章" ON blog_posts
  FOR UPDATE TO authenticated USING (auth.uid() = author_id OR is_admin()) WITH CHECK (auth.uid() = author_id OR is_admin());

CREATE POLICY "作者可删除博客文章" ON blog_posts
  FOR DELETE TO authenticated USING (auth.uid() = author_id OR is_admin());

