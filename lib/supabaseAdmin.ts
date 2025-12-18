import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from './env';

/**
 * Server-only Supabase admin client
 * Uses the service role key which BYPASSES Row Level Security (RLS)
 * WARNING: Never expose this to the client! Only use in API routes or server components
 * Only use when you need to bypass RLS for trusted server-side operations
 */
export const supabaseAdmin = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey(),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
