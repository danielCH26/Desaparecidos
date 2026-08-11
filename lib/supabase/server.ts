import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseUrl, supabaseAnonKey } from '../env';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client (RSC, Server Actions, Route Handlers).
 * Uses ANON key + cookies — NOT service_role. Service role bypasses RLS
 * and would silently break owner-only reads (auth.uid() would be NULL).
 *
 * In Next.js 15, `cookies()` returns a Promise; await it.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — can't write cookies.
          // Safe to ignore; middleware will refresh the session.
        }
      },
    },
  });
}
