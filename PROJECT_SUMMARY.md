# PromptShare 项目总结

## 项目概述

PromptShare 是一个AI提示词分享平台，用户可以浏览、搜索、上传和分享各种AI提示词。该项目使用现代化的Web技术栈构建，具有响应式设计，支持用户认证和管理功能。

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **编程语言**: TypeScript
- **样式库**: Tailwind CSS + shadcn/ui 组件库
- **状态管理**: Zustand
- **后端服务**: Supabase (提供数据库、认证和存储服务)
- **图标库**: Lucide React
- **部署平台**: Vercel

## 项目结构

```
my-prompthub/
├── .env.local              # 环境变量文件（不提交到版本控制）
├── .env.local.example      # 环境变量示例文件
├── .gitignore              # Git忽略文件配置
├── next.config.js          # Next.js配置文件
├── tailwind.config.js      # Tailwind CSS配置文件
├── tsconfig.json           # TypeScript配置文件
├── package.json            # 项目依赖和脚本配置
├── components.json         # shadcn/ui配置文件
├── README.md               # 项目说明文档
├── SUPABASE_SETUP.md       # Supabase数据库设置指南
├── supabase_schema.sql     # Supabase数据库表结构SQL脚本
├── PROJECT_SUMMARY.md      # 项目总结文档（当前文件）
├── FIXES_SUMMARY.md        # 问题修复总结文档
│
├── /src
│   ├── /app                # Next.js App Router页面路由
│   ├── /components         # React组件
│   ├── /hooks              # 自定义React hooks
│   ├── /lib                # 工具函数和配置
│   ├── /services           # 业务逻辑和API服务
│   ├── /store              # 状态管理（Zustand）
│   ├── /styles             # 全局样式
│   └── /types              # TypeScript类型定义
│
├── /public                 # 静态资源文件
└── /node_modules           # 项目依赖（不提交到版本控制）
```

## 核心功能

### 1. 用户系统
- 用户注册和登录（基于Supabase Auth）
- 用户个人资料管理
- 管理员权限系统

### 2. 提示词管理
- 浏览和搜索提示词
- 上传新的提示词
- 收藏喜欢的提示词
- 提示词分类和标签

### 3. 管理功能
- 管理员仪表板
- 内容审核
- 用户管理

## 环境配置

项目使用环境变量来存储敏感信息，需要在 `.env.local` 文件中配置以下变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
```

## 数据库设置

项目使用Supabase PostgreSQL数据库，需要创建以下表：

1. `prompts` - 存储提示词信息
2. `users` - 扩展用户信息表
3. `user_favorites` - 用户收藏提示词关联表

详细的数据库设置请参考 `SUPABASE_SETUP.md` 文件。

## 部署说明

项目已配置为可部署到Vercel平台：

1. 将代码推送到GitHub仓库
2. 在Vercel中创建新项目并导入GitHub仓库
3. 配置环境变量
4. 部署项目

## 安全措施

1. 使用 `.gitignore` 文件确保敏感信息不被提交到版本控制
2. 环境变量存储敏感配置信息
3. Supabase行级安全策略（RLS）保护数据访问
4. 用户认证和权限控制

## 项目特点

- 响应式设计，适配各种设备屏幕
- 英文界面，简洁易用
- 完整的用户认证流程
- 管理员后台管理系统
- 收藏和搜索功能
- 代码结构清晰，易于维护和扩展

## 开发说明

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 启动生产服务器
```bash
npm run start
```

## 问题修复记录

项目开发过程中遇到并解决的问题请参考 `FIXES_SUMMARY.md` 文件。

## 许可证

本项目采用MIT许可证，详情请查看LICENSE文件。