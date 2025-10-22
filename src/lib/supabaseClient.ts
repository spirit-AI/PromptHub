import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Check if we're in browser or server environment
const isBrowser = typeof window !== 'undefined';

// Create a singleton instance
let supabaseInstance: SupabaseClient | null = null;

export const createClient = () => {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Get environment variables - works in both browser and server
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Return null if no URL or key (e.g., during build time or missing env vars)
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isBrowser) {
      console.warn('Supabase URL or Anon Key not set. Please check your environment variables.');
    }
    return null;
  }
  
  // Check if URL starts with http or https
  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    if (isBrowser) {
      console.warn('Invalid Supabase URL format. It should start with http:// or https://');
    }
    return null;
  }
  
  try {
    // Validate URL format
    new URL(supabaseUrl);
  } catch (error) {
    if (isBrowser) {
      console.warn('Invalid Supabase URL format:', supabaseUrl);
    }
    return null;
  }

  try {
    const client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'my-prompthub'
        }
      }
    });
    
    // Store the instance for future use
    if (isBrowser) {
      supabaseInstance = client;
    }
    
    return client;
  } catch (error) {
    if (isBrowser) {
      console.warn('Failed to create Supabase client:', error);
    }
    return null;
  }
};

// Create a singleton instance for client-side usage
let supabase: SupabaseClient | null = null;
if (isBrowser) {
  supabase = createClient();
}

export { supabase };