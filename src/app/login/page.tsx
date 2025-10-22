'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Chrome } from 'lucide-react';

// 创建一个独立的组件来处理useSearchParams
const LoginContent = () => {
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { signInWithEmail, signInWithGoogle, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // 模拟加载状态检查
  useEffect(() => {
    // 检查是否在浏览器环境中
    if (typeof window !== 'undefined') {
      setLoading(false);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading && !loading) {
      router.push(callbackUrl);
    }
  }, [user, authLoading, loading, callbackUrl, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setError('');

    try {
      await signInWithEmail(email, password);
      // 成功登录后，useEffect会处理重定向
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message && err.message.includes('Supabase client not initialized')) {
        setError('系统配置错误：请检查环境变量配置');
      } else {
        setError('登录失败，请检查邮箱和密码');
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoggingIn(true);
    try {
      await signInWithGoogle();
      // Google登录会重定向到OAuth提供商，所以这里不需要处理重定向
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err.message && err.message.includes('Supabase client not initialized')) {
        setError('系统配置错误：请检查环境变量配置');
      } else {
        setError('Google登录失败');
      }
    } finally {
      setLoggingIn(false);
    }
  };

  // 显示加载状态
  if (loading || authLoading) {
    return (
      <div className="text-center">
        <p className="text-gray-600">正在加载认证信息...</p>
      </div>
    );
  }

  // 如果已经登录，显示重定向信息
  if (user) {
    return (
      <div className="text-center">
        <p className="text-gray-600">登录成功，正在跳转...</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">登录到 PromptHub</CardTitle>
        <CardDescription>使用您的账户登录以继续</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary-500 hover:bg-primary-600"
            disabled={loggingIn || authLoading}
          >
            {loggingIn ? '登录中...' : '登录'}
          </Button>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">或者</span>
          </div>
        </div>
        
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full"
          disabled={loggingIn || authLoading}
        >
          <Chrome className="w-4 h-4 mr-2" />
          使用 Google 账户登录
        </Button>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          还没有账户？{' '}
          <button 
            onClick={() => router.push('/signup')}
            className="text-primary-500 hover:underline"
          >
            注册新账户
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <Suspense fallback={<div>加载中...</div>}>
          <LoginContent />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}