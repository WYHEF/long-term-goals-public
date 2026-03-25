-- 添加博客功能表
-- 执行日期: 2026-01-07

CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'published',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_categories_user_id ON blog_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的博客分类" ON blog_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的博客分类" ON blog_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的博客分类" ON blog_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的博客分类" ON blog_categories
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "用户只能查看自己的博客文章" ON blog_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的博客文章" ON blog_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的博客文章" ON blog_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的博客文章" ON blog_posts
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

