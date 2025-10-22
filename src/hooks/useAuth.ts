'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/user';
import { createClient } from '@/lib/supabaseClient';

// 添加用户数据缓存
let cachedUser: User | null = null;
let isFetchingUser = false;
const userListeners: Array<(user: User | null) => void> = [];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  // 如果supabase未初始化，立即设置loading为false
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
    }
  }, [supabase]);

  const fetchUser = useCallback(async () => {
    // 如果supabase未初始化，直接返回
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    // 如果正在获取用户数据，添加监听器而不是重新获取
    if (isFetchingUser) {
      return new Promise<void>((resolve) => {
        const listener = (user: User | null) => {
          setUser(user);
          userListeners.splice(userListeners.indexOf(listener), 1);
          resolve();
        };
        userListeners.push(listener);
      });
    }
    
    isFetchingUser = true;
    setLoading(true);
    
    try {
      // 设置超时机制，防止长时间等待
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout')), 10000) // 10秒超时
      );
      
      const getUserPromise = supabase.auth.getUser();
      
      const { data: { user: supabaseUser }, error } = await Promise.race([
        getUserPromise,
        timeoutPromise
      ]) as any;
      
      if (error) {
        // 如果是未认证错误，这是正常的，不需要报错
        if (error.message.includes('not authenticated') || error.message.includes('missing') || error.message.includes('Unable to get')) {
          cachedUser = null;
        } else {
          console.warn('Error getting user from Supabase auth:', error.message);
          // 特别处理403错误
          if ('status' in error && (error as any).status === 403) {
            console.warn('403 Forbidden error - check your Supabase RLS policies and user permissions');
          }
          cachedUser = null;
        }
        // 通知所有监听器
        userListeners.forEach(listener => listener(cachedUser));
        userListeners.length = 0;
        setUser(cachedUser);
        isFetchingUser = false;
        return;
      }
      
      if (supabaseUser) {
        try {
          // Fetch additional user data from users table
          const timeoutPromise2 = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('User data fetch timeout')), 5000) // 5秒超时
          );
          
          const userDataPromise = supabase
            .from('users')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();
          
          const { data: userData, error: userError } = await Promise.race([
            userDataPromise,
            timeoutPromise2
          ]) as any;
          
          if (userError) {
            // 如果users表中没有数据，使用auth用户数据
            console.debug('User data not found in users table, using auth data only:', userError.message);
            // 特别处理403错误
            if ('status' in userError && (userError as any).status === 403) {
              console.warn('403 Forbidden error when fetching user data - check your Supabase RLS policies');
            }
            cachedUser = {
              id: supabaseUser.id,
              username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '',
              email: supabaseUser.email || '',
              role: supabaseUser.user_metadata?.role || 'user',
              created_at: supabaseUser.created_at,
            };
          } else {
            cachedUser = {
              id: supabaseUser.id,
              username: userData?.username || supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '',
              email: supabaseUser.email || '',
              avatar_url: userData?.avatar_url || '',
              bio: userData?.bio || '',
              role: userData?.role || supabaseUser.user_metadata?.role || 'user',
              created_at: supabaseUser.created_at,
            };
          }
        } catch (userDataError: any) {
          // 如果获取用户数据失败，至少使用auth用户数据
          console.debug('Error fetching user data, using auth data only:', userDataError.message);
          // 特别处理403错误
          if (userDataError && typeof userDataError === 'object' && 'status' in userDataError && userDataError.status === 403) {
            console.warn('403 Forbidden error when fetching user data - check your Supabase RLS policies');
          }
          cachedUser = {
            id: supabaseUser.id,
            username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '',
            email: supabaseUser.email || '',
            role: supabaseUser.user_metadata?.role || 'user',
            created_at: supabaseUser.created_at,
          };
        }
      } else {
        cachedUser = null;
      }
      
      // 通知所有监听器
      userListeners.forEach(listener => listener(cachedUser));
      userListeners.length = 0;
      setUser(cachedUser);
    } catch (error: any) {
      console.debug('Unexpected error fetching user:', error.message);
      // 特别处理403错误
      if (error && typeof error === 'object' && 'status' in error && error.status === 403) {
        console.warn('403 Forbidden error when fetching user - check your Supabase RLS policies');
      }
      cachedUser = null;
      // 通知所有监听器
      userListeners.forEach(listener => listener(cachedUser));
      userListeners.length = 0;
      setUser(cachedUser);
    } finally {
      isFetchingUser = false;
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // 只在浏览器环境中执行
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }
    
    // 添加一个简短的延迟，确保组件完全挂载
    const timer = setTimeout(() => {
      fetchUser();
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [fetchUser, supabase]);

  useEffect(() => {
    // 如果supabase未初始化，不设置监听器
    if (!supabase) {
      return;
    }
    
    // 只在浏览器环境中执行
    if (typeof window === 'undefined') {
      return;
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('Auth state changed:', _event, session?.user?.id);
        if (session?.user) {
          fetchUser();
        } else {
          cachedUser = null;
          setUser(null);
        }
      }
    );

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [fetchUser, supabase]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('System configuration error: Supabase client not initialized, please check environment variable configuration');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // 特别处理403错误
      if ('status' in error && (error as any).status === 403) {
        throw new Error('Login failed: Insufficient permissions, please check your account status');
      }
      throw error;
    }
    
    // 获取用户数据
    await fetchUser();
    
    return data;
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      throw new Error('System configuration error: Supabase client not initialized, please check environment variable configuration');
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      // 特别处理403错误
      if ('status' in error && (error as any).status === 403) {
        throw new Error('Google login failed: Insufficient permissions, please check your account status');
      }
      throw error;
    }
    return data;
  };

  const signUp = async (email: string, password: string, username: string) => {
    if (!supabase) {
      throw new Error('System configuration error: Supabase client not initialized, please check environment variable configuration');
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    
    if (error) {
      // 特别处理403错误
      if ('status' in error && (error as any).status === 403) {
        throw new Error('Signup failed: Insufficient permissions, please check your account status');
      }
      throw error;
    }
    
    // 获取用户数据
    if (data.user) {
      await fetchUser();
    }
    
    // Note: With the new trigger in the database, user data should be automatically inserted
    // We no longer need to manually insert user data here
    
    return data;
  };

  const signOut = async () => {
    if (!supabase) {
      throw new Error('System configuration error: Supabase client not initialized, please check environment variable configuration');
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      // 特别处理403错误
      if ('status' in error && (error as any).status === 403) {
        throw new Error('Sign out failed: Insufficient permissions');
      }
      throw error;
    }
    cachedUser = null;
    setUser(null);
  };

  // 如果supabase未初始化，返回默认值
  if (!supabase) {
    return {
      user: null,
      loading: false,
      signInWithEmail: async () => { throw new Error('System configuration error: Supabase client not initialized, please check environment variable configuration'); },
      signInWithGoogle: async () => { throw new Error('System configuration error: Supabase client not initialized, please check environment variable configuration'); },
      signUp: async () => { throw new Error('System configuration error: Supabase client not initialized, please check environment variable configuration'); },
      signOut: async () => { throw new Error('System configuration error: Supabase client not initialized, please check environment variable configuration'); },
    };
  }

  return {
    user,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signUp,
    signOut,
  };
};