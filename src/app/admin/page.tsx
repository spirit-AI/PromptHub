'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePromptStore } from '@/store/usePromptStore';
import { Prompt } from '@/types/prompt';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PromptList from '@/components/PromptList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, FileText, Shield } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { prompts, fetchPrompts } = usePromptStore();
  const [pendingPrompts, setPendingPrompts] = useState<Prompt[]>([]);
  const [reportedPrompts, setReportedPrompts] = useState<Prompt[]>([]);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Check if user is admin (只检查role字段)
  const isAdmin = user?.role === 'admin';

  // Handle redirects in useEffect to avoid setState during render
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push('/login?callbackUrl=/admin');
      return;
    }

    // Redirect to home if not admin
    if (user && !isAdmin) {
      setShouldRedirect(true);
    }
  }, [user, isAdmin, router, authLoading]);

  // Handle redirect after state update
  useEffect(() => {
    if (shouldRedirect) {
      router.push('/');
    }
  }, [shouldRedirect, router]);

  // Fetch prompts and filter them
  useEffect(() => {
    if (user && isAdmin) {
      fetchPrompts().then(() => {
        // Filter pending prompts (in a real app, these would have a status field)
        setPendingPrompts(prompts.filter(prompt => prompt.status === 'pending'));
        
        // Filter reported prompts (in a real app, these would be in a separate table)
        setReportedPrompts(prompts.filter(prompt => (prompt.reported_count || 0) > 0));
      });
    }
  }, [user, isAdmin, prompts, fetchPrompts]);

  const handleApprovePrompt = (promptId: string) => {
    // TODO: Implement prompt approval
    console.log('Approve prompt', promptId);
  };

  const handleDeletePrompt = (promptId: string) => {
    // TODO: Implement prompt deletion
    console.log('Delete prompt', promptId);
  };

  const handleBanUser = (userId: string) => {
    // TODO: Implement user banning
    console.log('Ban user', userId);
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-600">正在验证权限...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If not authenticated, redirect to login (handled by useEffect)
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-600">正在跳转到登录页面...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If not admin, show unauthorized message
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">访问被拒绝</h1>
            <p className="text-gray-600 mb-6">您没有权限访问管理后台</p>
            <p className="text-gray-500 text-sm mb-4">当前用户: {user?.email} (角色: {user?.role || '未设置'})</p>
            <Button onClick={() => router.push('/')}>返回首页</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">管理后台</h1>
            <div className="flex space-x-2">
              <Button 
                onClick={() => router.push('/upload')}
                className="bg-primary-500 hover:bg-primary-600"
              >
                Upload Prompt
              </Button>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
              >
                返回首页
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总提示词</CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{prompts.length}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">用户数</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+180 from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">待审核</CardTitle>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingPrompts.length}</div>
                <p className="text-xs text-muted-foreground">需要处理</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">待审核</TabsTrigger>
              <TabsTrigger value="reported">被举报</TabsTrigger>
              <TabsTrigger value="users">用户管理</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>待审核提示词</CardTitle>
                  <CardDescription>需要审核的新提示词</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingPrompts.length > 0 ? (
                    <div className="space-y-4">
                      {pendingPrompts.map(prompt => (
                        <div key={prompt.id} className="border rounded-lg p-4">
                          <h3 className="font-semibold">{prompt.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{prompt.description}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {prompt.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeletePrompt(prompt.id)}
                            >
                              拒绝
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleApprovePrompt(prompt.id)}
                            >
                              通过
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      暂无待审核的提示词
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reported">
              <Card>
                <CardHeader>
                  <CardTitle>被举报提示词</CardTitle>
                  <CardDescription>用户举报的提示词</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportedPrompts.length > 0 ? (
                    <div className="space-y-4">
                      {reportedPrompts.map(prompt => (
                        <div key={prompt.id} className="border rounded-lg p-4">
                          <h3 className="font-semibold">{prompt.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{prompt.description}</p>
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <span>举报次数: {prompt.reported_count}</span>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeletePrompt(prompt.id)}
                            >
                              删除
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                            >
                              忽略
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      暂无被举报的提示词
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>用户管理</CardTitle>
                  <CardDescription>管理平台用户</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    用户管理功能即将上线
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}