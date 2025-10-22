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
  const [loadTimeout, setLoadTimeout] = useState(false);

  // 检查是否在浏览器环境中
  useEffect(() => {
    // 检查是否在浏览器环境中
    if (typeof window !== 'undefined') {
      setLoading(false);
    }
  }, []);

  // 添加超时机制，防止加载状态持续太久
  useEffect(() => {
    if (loading || authLoading) {
      const timer = setTimeout(() => {
        if (loading || authLoading) {
          setLoadTimeout(true);
          // 强制设置加载状态为false，使表单可交互
          setLoading(false);
        }
      }, 5000); // 5秒后超时

      return () => clearTimeout(timer);
    }
  }, [loading, authLoading]);

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
    setLoadTimeout(false); // 重置超时状态

    try {
      await signInWithEmail(email, password);
      // 成功登录后，useEffect会处理重定向
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message && err.message.includes('Supabase client not initialized')) {
        setError('System configuration error: Please check environment variable configuration');
      } else if (err.message && err.message.includes('timeout')) {
        setError('Authentication timeout. Please check your network connection and try again.');
      } else {
        setError('Login failed, please check your email and password');
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoggingIn(true);
    setError('');
    setLoadTimeout(false); // 重置超时状态

    try {
      await signInWithGoogle();
      // Google登录会重定向到OAuth提供商，所以这里不需要处理重定向
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err.message && err.message.includes('Supabase client not initialized')) {
        setError('System configuration error: Please check environment variable configuration');
      } else if (err.message && err.message.includes('timeout')) {
        setError('Authentication timeout. Please check your network connection and try again.');
      } else {
        setError('Google login failed');
      }
    } finally {
      setLoggingIn(false);
    }
  };

  // 如果已经登录，显示重定向信息
  if (user && !loading && !authLoading) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Login successful, redirecting...</p>
      </div>
    );
  }

  // 显示登录表单（即使在加载状态下也显示表单，除非用户已登录）
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign in to PromptShare</CardTitle>
        <CardDescription>Sign in with your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        {(loading || authLoading) && !loadTimeout && (
          <div className="text-center mb-4">
            <p className="text-gray-600">Loading authentication information...</p>
          </div>
        )}
        
        {loadTimeout && (
          <div className="text-center mb-4">
            <p className="text-yellow-600">Authentication is taking longer than expected. You can try to login below.</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
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
                disabled={loggingIn}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="pl-10"
                required
                minLength={6}
                disabled={loggingIn}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary-500 hover:bg-primary-600"
            disabled={loggingIn}
          >
            {loggingIn ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>
        
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full"
          disabled={loggingIn}
        >
          <Chrome className="w-4 h-4 mr-2" />
          Sign in with Google
        </Button>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <button 
            onClick={() => router.push('/signup')}
            className="text-primary-500 hover:underline"
            disabled={loggingIn}
          >
            Sign up for a new account
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
        <Suspense fallback={<div>Loading...</div>}>
          <LoginContent />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}