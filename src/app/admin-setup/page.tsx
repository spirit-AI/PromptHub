'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSetupPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const supabase = createClient();

  const makeAdminById = async () => {
    if (!userId) {
      setResult({ success: false, message: '请输入用户ID' });
      return;
    }
    
    if (!supabase) {
      setResult({ success: false, message: 'Supabase客户端未初始化' });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId);
      
      if (error) throw error;
      
      setResult({ success: true, message: '用户已成功设置为管理员' });
    } catch (error: any) {
      console.error('Error making user admin:', error);
      setResult({ success: false, message: `设置失败: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const makeAdminByEmail = async () => {
    if (!email) {
      setResult({ success: false, message: '请输入邮箱' });
      return;
    }
    
    if (!supabase) {
      setResult({ success: false, message: 'Supabase客户端未初始化' });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      // First, find the user ID by email from auth.users
      const { data: authUser, error: authError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single();
      
      if (authError) throw authError;
      if (!authUser) throw new Error('未找到该邮箱的用户');
      
      // Then update the user role in our users table
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', authUser.id);
      
      if (error) throw error;
      
      setResult({ success: true, message: '用户已成功设置为管理员' });
    } catch (error: any) {
      console.error('Error making user admin:', error);
      setResult({ success: false, message: `设置失败: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const createAdminUser = async () => {
    if (!email) {
      setResult({ success: false, message: '请输入邮箱' });
      return;
    }
    
    if (!supabase) {
      setResult({ success: false, message: 'Supabase客户端未初始化' });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      // This is a simplified version - in practice, you would need to:
      // 1. Create the user in auth
      // 2. Insert the user into the users table with admin role
      // For now, we'll just show the process
      
      setResult({ 
        success: true, 
        message: `请在Supabase控制台中手动创建邮箱为 ${email} 的用户，然后使用上面的方法将其设置为管理员。` 
      });
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      setResult({ success: false, message: `创建失败: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">管理员账号设置</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>通过用户ID设置管理员</CardTitle>
              <CardDescription>输入用户的UUID来将其设置为管理员</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                  用户ID (UUID)
                </label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="输入用户的UUID"
                />
              </div>
              <Button 
                onClick={makeAdminById} 
                disabled={loading}
                className="w-full"
              >
                {loading ? '设置中...' : '设置为管理员'}
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>通过邮箱设置管理员</CardTitle>
              <CardDescription>输入用户的邮箱来将其设置为管理员</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  用户邮箱
                </label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="输入用户的邮箱"
                  type="email"
                />
              </div>
              <Button 
                onClick={makeAdminByEmail} 
                disabled={loading}
                className="w-full"
              >
                {loading ? '设置中...' : '设置为管理员'}
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>创建新的管理员账号</CardTitle>
              <CardDescription>创建一个新的管理员账号</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="newAdminEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  管理员邮箱
                </label>
                <Input
                  id="newAdminEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="输入管理员邮箱"
                  type="email"
                />
              </div>
              <Button 
                onClick={createAdminUser} 
                disabled={loading}
                className="w-full"
              >
                {loading ? '创建中...' : '创建管理员账号'}
              </Button>
            </CardContent>
          </Card>
          
          {result && (
            <Card>
              <CardContent className={`p-4 ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {result.message}
              </CardContent>
            </Card>
          )}
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">使用说明</h3>
            <ul className="list-disc pl-5 space-y-1 text-blue-700">
              <li>首先确保用户已经在系统中注册</li>
              <li>使用用户ID或邮箱将其设置为管理员</li>
              <li>设置完成后，该用户就可以访问 <code className="bg-blue-100 px-1 rounded">/admin</code> 页面</li>
              <li>默认的管理员邮箱是 <code className="bg-blue-100 px-1 rounded">admin@example.com</code></li>
              <li>您也可以在环境变量中设置 <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_ADMIN_EMAIL</code> 来指定管理员邮箱</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}