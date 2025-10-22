# Supabase 数据库设置指南

本指南将帮助您在Supabase中设置PromptShare项目所需的数据库表和策略。

## 📋 数据库表结构

### 1. 创建 `prompts` 表

```sql
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
```

### 2. 创建 `users` 表

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. 创建 `user_favorites` 表

```sql
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);
```

## ⚙️ 设置步骤

### 步骤 1: 登录Supabase控制台

1. 访问 [Supabase Dashboard](https://app.supabase.com/)
2. 登录您的账户
3. 选择您的项目

### 步骤 2: 创建数据库表

1. 在左侧导航栏中点击 "SQL Editor"
2. 复制并粘贴以下SQL脚本到编辑器中
3. 点击 "Run" 执行脚本

或者您可以分别创建每个表：

#### 创建 prompts 表
```sql
-- 在SQL Editor中执行以下语句
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
```

#### 创建 users 表
```sql
-- 在SQL Editor中执行以下语句
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 创建 user_favorites 表
```sql
-- 在SQL Editor中执行以下语句
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);
```

### 步骤 3: 创建更新时间戳函数和触发器

```sql
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
```

### 步骤 4: 设置行级安全 (RLS) 策略

```sql
-- 启用RLS
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

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

-- users 表的 RLS 策略
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
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

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
```

### 步骤 5: 创建索引以提高查询性能

```sql
-- 创建索引
CREATE INDEX IF NOT EXISTS idx_prompts_author_id ON prompts(author_id);
CREATE INDEX IF NOT EXISTS idx_prompts_model ON prompts(model);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_prompt_id ON user_favorites(prompt_id);
```

## 👤 设置管理员账号

有两种方式可以设置管理员账号：

### 方法一：通过数据库直接设置（推荐）

1. 首先注册一个普通用户账号
2. 获取该用户的ID（可以在Supabase Auth控制台中找到）
3. 在SQL Editor中执行以下语句：

```sql
UPDATE users 
SET role = 'admin' 
WHERE id = '用户的UUID';
```

### 方法二：通过邮箱设置

当前实现也支持通过邮箱检查来识别管理员。您可以：

1. 注册一个邮箱为 `admin@example.com` 的账号
2. 该账号将自动具有管理员权限

## 🔐 认证设置

确保启用了电子邮件认证：

1. 在Supabase控制台中，转到 "Authentication" > "Providers"
2. 启用 "Email" 提供商
3. 配置您的SMTP设置（可选，用于发送验证邮件）

## 🌐 获取API密钥

1. 在Supabase控制台中，转到 "Project Settings" > "API"
2. 复制 "Project URL" 和 "anon public" 密钥
3. 将这些值添加到您的 `.env.local` 文件中：

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## ✅ 验证设置

完成以上步骤后，您的Supabase数据库应该已经正确配置。您可以：

1. 重启您的开发服务器
2. 尝试注册一个新用户
3. 登录并尝试创建一个Prompt
4. 将某个用户设置为管理员并访问 `/admin` 页面

如果一切正常，您应该能够正常使用所有功能。