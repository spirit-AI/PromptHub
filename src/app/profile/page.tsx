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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, User, Heart } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { prompts, fetchPrompts } = usePromptStore();
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([]);
  const [favoritePrompts, setFavoritePrompts] = useState<Prompt[]>([]);
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  // Redirect to login if not authenticated
  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  useEffect(() => {
    fetchPrompts().then(() => {
      // Filter user's prompts
      const myPrompts = prompts.filter(prompt => prompt.author_id === user.id);
      setUserPrompts(myPrompts);
      
      // TODO: Filter favorite prompts (need to implement favorites)
      setFavoritePrompts([]);
    });
  }, [user.id, prompts, fetchPrompts]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update
    console.log('Update profile', { username, bio, avatarUrl });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">个人资料</h1>
            <div className="flex space-x-2">
              <Button 
                onClick={() => router.push('/upload')}
                className="bg-primary-500 hover:bg-primary-600"
              >
                Upload Prompt
              </Button>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">个人资料</TabsTrigger>
              <TabsTrigger value="prompts">我的提示词</TabsTrigger>
              <TabsTrigger value="favorites">收藏</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>编辑个人资料</CardTitle>
                  <CardDescription>更新您的个人信息</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          头像
                        </label>
                        <Input 
                          type="file" 
                          accept="image/*" 
                          className="text-sm"
                          // TODO: Implement avatar upload
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        用户名
                      </label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="用户名"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        个人简介
                      </label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="介绍一下自己"
                        rows={3}
                      />
                    </div>
                    
                    <Button type="submit" className="bg-primary-500 hover:bg-primary-600">
                      保存更改
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="prompts">
              <Card>
                <CardHeader>
                  <CardTitle>我上传的提示词</CardTitle>
                  <CardDescription>您创建的所有提示词</CardDescription>
                </CardHeader>
                <CardContent>
                  {userPrompts.length > 0 ? (
                    <PromptList prompts={userPrompts} />
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">您还没有上传任何提示词</p>
                      <Button onClick={() => router.push('/upload')}>
                        上传第一个提示词
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle>我的收藏</CardTitle>
                  <CardDescription>您收藏的提示词</CardDescription>
                </CardHeader>
                <CardContent>
                  {favoritePrompts.length > 0 ? (
                    <PromptList prompts={favoritePrompts} />
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">您还没有收藏任何提示词</p>
                      <Button onClick={() => router.push('/')}>
                        浏览提示词
                      </Button>
                    </div>
                  )}
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