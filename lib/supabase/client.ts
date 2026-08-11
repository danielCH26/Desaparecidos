'use client';

import { createBrowserClient } from '@supabase/ssr';
import { supabaseUrl, supabaseAnonKey } from '../env';
import type { SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

/**
 * Browser-side Supabase client.
 * Uses the anon key — safe for client-side use under RLS.
 */
export function createSupabaseBrowserClient(): SupabaseClient {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Singleton instance for client-side usage.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient();
  }
  return browserClient;
}
