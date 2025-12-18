import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseUrl, getSupabaseAnonKey } from './env';

/**
 * Browser-safe Supabase client
 * Uses the anon key which respects Row Level Security (RLS) policies
 * Safe to use in client components
 */
export const supabase = createBrowserClient(
  getSupabaseUrl(),
  getSupabaseAnonKey()
);
