/**
 * Environment variable loader with fail-fast validation.
 * Fails at module load if any required variable is missing.
 */

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

const env: Record<string, string> = {};

// Validate and load required environment variables at module load time
for (const key of requiredVars) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  env[key] = value;
}

// Re-export with proper typing (type assertion after fail-fast validation)
export const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL as string;
export const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
export const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY as string;

/**
 * Typed env object for convenience.
 * All required variables are guaranteed to be strings.
 */
export const envConfig = {
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
} as const;
