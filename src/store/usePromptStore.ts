import { create } from 'zustand';
import { Prompt } from '@/types/prompt';
import { createClient } from '@/lib/supabaseClient';

interface PromptStore {
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  fetchPrompts: () => Promise<void>;
  fetchPromptById: (id: string) => Promise<Prompt | null>;
  addPrompt: (promptData: Omit<Prompt, 'id' | 'created_at'>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
}

// 添加全局缓存变量
let globalPromptsCache: Prompt[] = [];
let isFetchingPrompts = false;
const promptFetchListeners: Array<(prompts: Prompt[]) => void> = [];

export const usePromptStore = create<PromptStore>((set, get) => ({
  prompts: globalPromptsCache,
  loading: false,
  error: null,
  lastFetchTime: null,
  
  fetchPrompts: async () => {
    const { lastFetchTime } = get();
    const now = Date.now();
    
    // 如果在1分钟内已经获取过数据，则不重新获取
    if (lastFetchTime && now - lastFetchTime < 1 * 60 * 1000) {
      return;
    }
    
    // 如果正在获取数据，添加监听器而不是重新获取
    if (isFetchingPrompts) {
      return new Promise<void>((resolve) => {
        const listener = (prompts: Prompt[]) => {
          set({ prompts });
          promptFetchListeners.splice(promptFetchListeners.indexOf(listener), 1);
          resolve();
        };
        promptFetchListeners.push(listener);
      });
    }
    
    const supabase = createClient();
    // 如果supabase未初始化，直接返回
    if (!supabase) {
      console.warn('Supabase client not initialized');
      set({ error: 'Supabase client not initialized', loading: false });
      return;
    }
    
    isFetchingPrompts = true;
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
      globalPromptsCache = data || [];
      // 通知所有监听器
      promptFetchListeners.forEach(listener => listener(globalPromptsCache));
      promptFetchListeners.length = 0;
      
      set({ prompts: globalPromptsCache, loading: false, lastFetchTime: now });
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
      const errorMessage = error.message || error.toString() || 'Failed to fetch prompts';
      set({ error: errorMessage, loading: false });
    } finally {
      isFetchingPrompts = false;
    }
  },
  
  fetchPromptById: async (id: string) => {
    // 先检查缓存中是否已有该提示词
    const { prompts } = get();
    const cachedPrompt = prompts.find(prompt => prompt.id === id);
    if (cachedPrompt) {
      return cachedPrompt;
    }
    
    const supabase = createClient();
    // 如果supabase未初始化，直接返回
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
      return data as Prompt;
    } catch (error: any) {
      console.error('Error fetching prompt:', error);
      return null;
    }
  },
  
  addPrompt: async (promptData) => {
    const supabase = createClient();
    // 如果supabase未初始化，抛出错误
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.');
    }
    
    try {
      console.log('Attempting to add prompt:', promptData);
      
      // 使用Supabase自动生成的ID和时间戳
      const { data, error } = await supabase
        .from('prompts')
        .insert([
          {
            ...promptData,
            // 移除手动设置的id和created_at，让Supabase自动生成
          },
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log('Prompt added successfully:', data);
      
      // 更新全局缓存
      globalPromptsCache = [data, ...globalPromptsCache];
      set({ prompts: globalPromptsCache });
    } catch (error: any) {
      console.error('Error adding prompt:', error);
      // 提供更详细的错误信息
      const errorMessage = error.message || '未知错误';
      throw new Error(`添加提示词失败: ${errorMessage}`);
    }
  },
  
  deletePrompt: async (id: string) => {
    const supabase = createClient();
    // 如果supabase未初始化，抛出错误
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.');
    }
    
    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // 更新全局缓存
      globalPromptsCache = globalPromptsCache.filter((prompt: Prompt) => prompt.id !== id);
      set({ prompts: globalPromptsCache });
    } catch (error) {
      console.error('Error deleting prompt:', error);
      throw new Error('删除提示词失败: ' + (error as Error).message);
    }
  },
}));