# Proposal: Phase 2 — Auth flow (cédula-based)

## Intent

Phase 1 shipped schema, RLS, and the auth trigger that reads `raw_user_meta_data->>'cedula'` and rejects any `auth.users` insert lacking it. Without register/login/profile, no later phase can identify publishers or enforce owner-only updates. End-to-end auth gates Phases 3–8.

## Scope

**In**: fill `lib/supabase/client.ts` (anon + `persistSession` + `autoRefreshToken`); replace service-role skeleton in `lib/supabase/server.ts` with anon + cookies via `@supabase/ssr`; Spanish `/register`, `/login`, `/profile`; auth-aware header; Server Action for logout.

**Out**: `/report/new` (3), comments/saves UI (5/6), password reset, rate limiting, form libraries.

## Capabilities

### New Capabilities
- `auth-client-wiring` — browser client + RSC cookie client (`@supabase/ssr`, anon, `cookies()`).
- `register-page` — RSC shell + Client form; cédula regex `^\d{6,10}$`, password ≥ 8, synthetic email, `signUp` with `options.data.cedula`. Spanish copy.
- `login-page` — synthetic email + `signInWithPassword`; redirect to `/`; "Cédula o contraseña incorrecta" on failure.
- `profile-page` — server-rendered; `SELECT profiles WHERE id = auth.uid()`; UPDATE `display_name`/`real_phone`/`real_email`. Anon → `/login`.
- `header-nav` — `<Header />` in `app/layout.tsx`; login/register (anon) or profile/logout (authed); server session prop + `onAuthStateChange` (no flash).
- `logout-action` — Server Action: `signOut()` via server client → `redirect('/')`.

### Modified Capabilities
None. Server-client swap is wiring, not a spec-level change.

## Approach

1. **Server client** — `createServerClient(url, anon, { cookies: { getAll, setAll } })` from `@supabase/ssr`. Keep service-role path available. Add `@supabase/ssr` to `package.json`.
2. **Synthetic email helper** — `lib/supabase/syntheticEmail.ts`: `(cedula) => \`${cedula}@example.net\``. Used only by register/login; never in DB queries.
3. **UUID-only client layer** — `profiles` queried by `id = auth.uid()`; never by cédula. Cédula = login resolution; UUID = identity.
4. **Forms** — RSC actions + plain HTML5. Client Components only for input state + toasts.

## Affected Areas

| Area | Impact |
|------|--------|
| `lib/supabase/client.ts` | Modified — add auth opts |
| `lib/supabase/server.ts` | Modified — anon+cookies via `@supabase/ssr` |
| `lib/supabase/syntheticEmail.ts` | New — helper |
| `app/register/{page,RegisterForm}.tsx` | New |
| `app/login/{page,LoginForm}.tsx` | New |
| `app/profile/page.tsx` | New |
| `components/ui/Header.tsx` | New |
| `app/layout.tsx` | Modified — mount Header |
| `app/_actions/auth.ts` | New — signOut Server Action |
| `package.json` | Modified — add `@supabase/ssr` |

## Open Questions (default if no answer)

1. `display_name` on register → **optional**.
2. Cédula UX feedback → **regex-on-submit**.
3. Logout mechanism → **Server Action** (cookie-clearing).
4. First-register redirect → **`/`**.

## Critical Couplings

- `signUp({ ..., options: { data: { cedula } } })` — missing `data.cedula` → trigger raises → signup fails.
- Server client MUST be anon + cookies, **NOT** service role. Service role bypasses RLS → `auth.uid()` NULL → owner-only reads silently fail.
- Verify Supabase email confirmation OFF (Dashboard → Auth → Providers → Email). Document in apply-progress.

## Risks

| Risk | Mitigation |
|------|------------|
| Apply slips → Phases 3–8 blocked | ~3 h apply; spec/design/tasks this session |
| Server-client wiring breaks cookie auth | `@supabase/ssr` is the official Next 14 pattern; smoke-test login |
| Cédula leaks into URL/DB key | Single helper; no `cedula=` in route handlers |
| Email confirmation left ON | Verify in Dashboard; document |

## Rollback Plan

Schema/RLS/trigger untouched. Revert commits + remove new pages/components → Phase 1 state.

## Success Criteria

- [ ] `build && lint && type-check` clean
- [ ] Register → edit profile → logout → login again, all Spanish copy
- [ ] Duplicate cédula → "Cédula ya registrada"
- [ ] Non-digit cédula or `password < 8` → Spanish client error
- [ ] `/` and `/reports` still browsable anonymously
- [ ] Profile UPDATE never touches `cedula`
- [ ] Header reflects auth state without flash
- [ ] Email confirmation OFF (verified + documented)