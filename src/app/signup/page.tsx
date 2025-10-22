'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, User } from 'lucide-react';

// 创建一个独立的组件来处理useSearchParams
const SignupContent = () => {
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { signUp, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [error, setError] = useState('');

  // 检查是否在浏览器环境中
  useEffect(() => {
    // 检查是否在浏览器环境中
    if (typeof window !== 'undefined') {
      setInitialLoading(false);
    }
  }, []);

  // 添加超时机制，防止加载状态持续太久
  useEffect(() => {
    if (initialLoading || authLoading) {
      const timer = setTimeout(() => {
        if (initialLoading || authLoading) {
          setLoadTimeout(true);
          // 强制设置加载状态为false，使表单可交互
          setInitialLoading(false);
        }
      }, 5000); // 5秒后超时

      return () => clearTimeout(timer);
    }
  }, [initialLoading, authLoading]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading && !initialLoading) {
      router.push(callbackUrl);
    }
  }, [user, authLoading, initialLoading, callbackUrl, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLoadTimeout(false); // 重置超时状态

    try {
      await signUp(email, password, username);
      // After successful signup, redirect to login page with success message
      router.push('/login?signup=success');
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.message && err.message.includes('Supabase client not initialized')) {
        setError('System configuration error: Please check environment variable configuration');
      } else if (err.message && err.message.includes('timeout')) {
        setError('Authentication timeout. Please check your network connection and try again.');
      } else if (err.message) {
        setError(`Signup failed: ${err.message}`);
      } else {
        setError('Signup failed, please check your input or contact administrator');
      }
    } finally {
      setLoading(false);
    }
  };

  // 如果已经登录，显示重定向信息
  if (user && !initialLoading && !authLoading) {
    return (
      <div className="text-center">
        <p className="text-gray-600">You are already logged in, redirecting...</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign up for PromptHub</CardTitle>
        <CardDescription>Create your account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        {(initialLoading || authLoading) && !loadTimeout && (
          <div className="text-center mb-4">
            <p className="text-gray-600">Loading authentication information...</p>
          </div>
        )}
        
        {loadTimeout && (
          <div className="text-center mb-4">
            <p className="text-yellow-600">Authentication is taking longer than expected. You can try to sign up below.</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>
          
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary-500 hover:bg-primary-600"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <button 
            onClick={() => router.push('/login')}
            className="text-primary-500 hover:underline"
            disabled={loading}
          >
            Sign in now
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <SignupContent />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}