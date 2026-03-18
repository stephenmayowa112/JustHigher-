import { createClient } from '@supabase/supabase-js';
import { Post, Subscriber } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key';

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Database interface for type safety
export interface Database {
  public: {
    Tables: {
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Post, 'id' | 'created_at'>>;
      };
      subscribers: {
        Row: Subscriber;
        Insert: Omit<Subscriber, 'id' | 'subscribed_at'>;
        Update: Partial<Omit<Subscriber, 'id' | 'subscribed_at'>>;
      };
    };
  };
}

// Re-export the same client as typedSupabase for backward compatibility
// (Avoids creating a second client instance with duplicate auth overhead)
export const typedSupabase = supabase;

// Admin client for bypassing RLS in server-side admin routes only
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);
