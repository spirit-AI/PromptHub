-- 创建 prompts 表
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  prompt_text TEXT NOT NULL,
  model TEXT NOT NULL,
  tags TEXT[],
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'approved',
  reported_count INTEGER DEFAULT 0
);

-- 创建 users 表（扩展 Supabase auth.users）
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 user_favorites 表
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 prompts 表创建更新时间戳触发器
DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
CREATE TRIGGER update_prompts_updated_at 
    BEFORE UPDATE ON prompts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 为 users 表创建更新时间戳触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 创建自动同步用户数据的函数和触发器
-- 当auth.users表中创建新用户时，自动在users表中创建对应的记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, avatar_url, bio, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'bio',
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    username = COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    avatar_url = NEW.raw_user_meta_data->>'avatar_url',
    bio = NEW.raw_user_meta_data->>'bio';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 为新用户创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 设置行级安全 (RLS) 策略
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- 删除已存在的策略（如果有的话）
DROP POLICY IF EXISTS "Public prompts are viewable by everyone" ON prompts;
DROP POLICY IF EXISTS "Users can insert their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can delete their own prompts" ON prompts;
DROP POLICY IF EXISTS "Admins can update all prompts" ON prompts;

DROP POLICY IF EXISTS "Public users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can insert their own user data" ON users;
DROP POLICY IF EXISTS "Users can update their own user data" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

DROP POLICY IF EXISTS "Users can view their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON user_favorites;

-- prompts 表的 RLS 策略
CREATE POLICY "Public prompts are viewable by everyone" 
    ON prompts FOR SELECT 
    USING (status = 'approved');

CREATE POLICY "Users can insert their own prompts" 
    ON prompts FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own prompts" 
    ON prompts FOR UPDATE 
    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own prompts" 
    ON prompts FOR DELETE 
    USING (auth.uid() = author_id);

CREATE POLICY "Admins can update all prompts" 
    ON prompts FOR ALL 
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- users 表的 RLS 策略 (修复无限递归问题)
CREATE POLICY "Public users are viewable by everyone" 
    ON users FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own user data" 
    ON users FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own user data" 
    ON users FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Admins can update all users" 
    ON users FOR ALL 
    USING (id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- 为 auth.users 表创建策略（如果需要直接访问）
-- 注意：通常不建议直接访问 auth.users 表，但如果您需要，可以添加以下策略
-- CREATE POLICY "Admins can view all auth users" 
--     ON auth.users FOR SELECT 
--     USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.users.id AND users.role = 'admin'));

-- user_favorites 表的 RLS 策略
CREATE POLICY "Users can view their own favorites" 
    ON user_favorites FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
    ON user_favorites FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
    ON user_favorites FOR DELETE 
    USING (auth.uid() = user_id);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_prompts_author_id ON prompts(author_id);
CREATE INDEX IF NOT EXISTS idx_prompts_model ON prompts(model);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_prompt_id ON user_favorites(prompt_id);

-- 创建检查用户同步触发器的函数
CREATE OR REPLACE FUNCTION public.check_user_sync_trigger()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  );
END;
$$ LANGUAGE plpgsql;