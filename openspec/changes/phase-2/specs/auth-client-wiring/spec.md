# auth-client-wiring Specification

## Purpose

Provides the two Supabase client factories (browser and RSC cookie server) plus the synthetic-email helper that every other Phase 2 capability depends on. The server client MUST use the anon key with cookies — not the service role — so `auth.uid()` resolves correctly under RLS when reading `profiles`.

This is wiring-level: there is no behavior change beyond restoring RSC cookie auth and the missing dependency. Schema, RLS, and the `handle_new_user` trigger are untouched (Phase 1).

## Requirements

### Requirement: @supabase/ssr dependency installed

The project MUST list `@supabase/ssr` under `dependencies` in `package.json`. The apply phase installs it via `npm install @supabase/ssr`.

#### Scenario: @supabase/ssr present in package.json

- GIVEN the repo at `/home/daniel/desaparecidos`
- WHEN `package.json` is read
- THEN `"@supabase/ssr"` MUST appear in `dependencies` with a SemVer range.

### Requirement: Browser client factory

`lib/supabase/client.ts` MUST export a function returning a Supabase client built with `createBrowserClient(supabaseUrl, supabaseAnonKey)` from `@supabase/ssr`. The current Phase 0 file is a skeleton and MUST be replaced.

#### Scenario: browser client is constructible

- GIVEN `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- WHEN the browser factory is called
- THEN it MUST return a non-null Supabase client (TypeScript unit test).

### Requirement: Server client uses anon key and cookies

`lib/supabase/server.ts` MUST build a Supabase client with `createServerClient(supabaseUrl, supabaseAnonKey, { cookies: { getAll, setAll } })` from `@supabase/ssr`, wiring Next.js `cookies()` to the `getAll`/`setAll` handlers. The client MUST receive the **anon** key, NEVER the service-role key — service role bypasses RLS, leaves `auth.uid()` NULL, and silently empties every owner-only read on `profiles`.

#### Scenario: server factory wired with anon, not service role

- GIVEN the server client factory module
- WHEN the second argument to `createServerClient` is traced back to its env var
- THEN that env var MUST be `NEXT_PUBLIC_SUPABASE_ANON_KEY` (unit test asserts variable name).

#### Scenario: server client resolves the auth cookie from the request

- GIVEN a Next.js request with Supabase auth cookies set via `signInWithPassword`
- WHEN the server client calls `auth.getUser()`
- THEN it MUST return the user matching those cookies (Playwright: log in via UI, load an RSC that prints the user id).

### Requirement: Env values re-exported

`lib/supabase/client.ts` and `lib/supabase/server.ts` MUST re-export `supabaseUrl`, `supabaseAnonKey`, and `supabaseServiceRoleKey` from `lib/env.ts`.

#### Scenario: env names importable from the supabase modules

- GIVEN `lib/env.ts` defines the three names
- WHEN `import { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } from '@/lib/supabase/client'` runs
- THEN all three names MUST resolve to the same values defined in `lib/env.ts`.

### Requirement: Synthetic email helper

`lib/supabase/syntheticEmail.ts` MUST export `syntheticEmailFor(cedula: string): string` returning `` `${cedula}@example.net` ``. Register and login MUST both consume this helper — no other code may construct the email string.

- The helper MUST be a pure, side-effect-free function: no DB calls, no logging, no I/O.

#### Scenario: helper returns canonical email

- WHEN `syntheticEmailFor('12345678')` is called
- THEN the result MUST equal `'12345678@example.net'` (TypeScript unit test).

#### Scenario: helper is deterministic

- GIVEN the helper called twice in the same process with the same input
- THEN both calls MUST return identical strings.

#### Scenario: literal domain appears in exactly one file

- GIVEN the project tree excluding `lib/supabase/syntheticEmail.ts` and `node_modules/`
- WHEN grepped for the substring `@example.net`
- THEN exactly one match (the helper) MUST be found (apply-phase smoke test).

### Requirement: Service role key never reaches the browser bundle

`lib/supabase/client.ts` MUST NOT read or export `supabaseServiceRoleKey`. Only server-side code may reference the service role, and only for migrations/admin scripts — never for request-path reads.

#### Scenario: browser bundle does not include service role

- WHEN `next build` runs with default config
- THEN a static analysis of the `.next/static` chunks MUST NOT contain `SUPABASE_SERVICE_ROLE_KEY` (or its value) (build smoke test).

### Requirement: No service role in RSC request path

Owner-only RSC reads of `profiles` MUST go through the server client (anon + cookies), not through a service-role shortcut.

#### Scenario: authenticated user reads own profile via server client

- GIVEN an authenticated user `U` with a `profiles` row
- WHEN the server client runs `SELECT * FROM profiles WHERE id = auth.uid()`
- THEN exactly one row MUST return (Phase 1 RLS `profiles` policy).

#### Scenario: anonymous request reads no profile rows

- GIVEN an anonymous request
- WHEN the server client runs `SELECT * FROM profiles`
- THEN zero rows MUST return.
