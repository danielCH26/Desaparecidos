/**
 * Environment variable loader with fail-fast validation.
 * Fails at module load if any required variable is missing.
 */

type RequiredEnvKey =
  | 'NEXT_PUBLIC_SUPABASE_URL'
  | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  | 'SUPABASE_SERVICE_ROLE_KEY';

type EnvConfig = Readonly<Record<RequiredEnvKey, string>>;

function readEnv(key: RequiredEnvKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Typed env object. Each required key is guaranteed to be a non-empty string.
 * Use `satisfies EnvConfig` so the literal is structurally checked without
 * widening or losing the precise key types.
 */
export const envConfig = {
  NEXT_PUBLIC_SUPABASE_URL: readEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: readEnv('SUPABASE_SERVICE_ROLE_KEY'),
} as const satisfies EnvConfig;

export const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseServiceRoleKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;