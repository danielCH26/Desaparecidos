import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseServiceRoleKey } from '../env';

/**
 * Server-side Supabase client.
 * Uses the service role key - has full database access.
 * MUST NOT be exposed to the client.
 */
export function createServerClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      // Server-side auth is not needed for service role operations
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Singleton instance for server-side usage
let supabaseServerInstance: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  if (!supabaseServerInstance) {
    supabaseServerInstance = createServerClient();
  }
  return supabaseServerInstance;
}
