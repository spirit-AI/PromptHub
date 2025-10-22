'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePromptStore } from '@/store/usePromptStore';
import { Prompt } from '@/types/prompt';
import { MODELS } from '@/lib/constants'; // 引入模型常量

export default function UploadPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addPrompt } = usePromptStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [promptText, setPromptText] = useState('');
  const [model, setModel] = useState('gpt-4-turbo');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [redirectTimer]);

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // 确保用户已认证
      if (!user) {
        throw new Error('User not authenticated');
      }

      const promptData: Omit<Prompt, 'id' | 'created_at'> = {
        title,
        description,
        prompt_text: promptText,
        model,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        author_id: user.id
      };

      console.log('Submitting prompt data:', promptData);
      await addPrompt(promptData);
      setSuccess(true);
      // 重置表单
      setTitle('');
      setDescription('');
      setPromptText('');
      setTags('');
      // 3秒后跳转到主页
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      setRedirectTimer(timer);
    } catch (err: any) {
      console.error('Upload error:', err);
      if (err.message && err.message.includes('Supabase client not initialized')) {
        setError('System configuration error: Please check environment variable configuration');
      } else if (err.message && err.message.includes('User not authenticated')) {
        setError('Please log in before uploading prompts');
      } else if (err.message) {
        setError(`Upload failed: ${err.message}`);
      } else {
        setError('Upload failed, please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  // 显示加载状态
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-600">Loading authentication information...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 如果未认证，显示重定向信息
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-600">Redirecting to login page...</p>
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Upload Prompt</h1>
          
          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Upload Successful!</h2>
              <p className="text-green-700">Your prompt has been successfully uploaded. Redirecting to homepage...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your prompt a name"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the purpose of this prompt"
                  rows={3}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="promptText" className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt Content *
                </label>
                <Textarea
                  id="promptText"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Enter your prompt content"
                  rows={8}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {MODELS.map((modelOption) => (
                    <option key={modelOption.id} value={modelOption.id}>
                      {modelOption.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Separate multiple tags with commas, e.g.: writing,creative,translation"
                />
                <p className="mt-1 text-sm text-gray-500">Separate multiple tags with commas</p>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : 'Upload Prompt'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}