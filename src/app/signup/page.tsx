'use client';

import { useState, Suspense } from 'react';
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
  const { signUp, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  if (user) {
    router.push(callbackUrl);
    return null;
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signUp(email, password, username);
      // After successful signup, redirect to login page with success message
      router.push('/login?signup=success');
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.message && err.message.includes('Supabase client not initialized')) {
        setError('系统配置错误：请检查环境变量配置');
      } else if (err.message) {
        setError(`注册失败：${err.message}`);
      } else {
        setError('注册失败，请检查输入信息或联系管理员');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">注册 PromptHub</CardTitle>
        <CardDescription>创建您的账户以开始使用</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              用户名
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="您的用户名"
                className="pl-10"
                required
              />
            </div>
          </div>
          
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
                placeholder="至少6位字符"
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary-500 hover:bg-primary-600"
            disabled={loading}
          >
            {loading ? '注册中...' : '注册'}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          已有账户？{' '}
          <button 
            onClick={() => router.push('/login')}
            className="text-primary-500 hover:underline"
          >
            立即登录
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
        <Suspense fallback={<div>加载中...</div>}>
          <SignupContent />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}