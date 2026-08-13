# register-fields Tasks

## Dependency Chain
1. Migration file (DB schema) → 2, 3
2. Server Action update → 3
3. RegisterForm Client update → 4
4. Register page Server update → 4
5. ProfileForm Client update → 5
6. Profile page Server update → 5
7. Smoke tests → 6, 7
8. Commit

## Atomic Tasks (7)

### T1 — Create `supabase/migrations/0002_register_fields.sql`
- **Files**: `supabase/migrations/0002_register_fields.sql` (new)
- Write the updated `handle_new_user()` per design.md
- **Verify**: file exists, has `CREATE OR REPLACE FUNCTION public.handle_new_user`, contains `real_email`/`real_phone` checks

### T2 — Update `app/actions/auth.ts`
- **Files**: `app/actions/auth.ts` (modify)
- `registerAction` reads `real_email` and `real_phone` formData, validates format, includes in `options.data`
- `updateProfileAction` also updates `real_email` and `real_phone`
- **Verify**: TypeScript compiles; `real_email`/`real_phone` included in insert/update payloads

### T3 — Update `components/forms/RegisterForm.tsx`
- **Files**: `components/forms/RegisterForm.tsx` (modify)
- Add `real_email` and `real_phone` state with client-side regex validation
- Add input fields with Spanish labels, helper text, error display
- Update `registerAction` call payload
- **Verify**: build green; form renders with the new fields

### T4 — Update `app/(auth)/register/page.tsx` (add info banner)
- **Files**: `app/(auth)/register/page.tsx` (modify)
- Add info banner above the form (per spec)
- **Verify**: curl GET /register shows banner text

### T5 — Update `components/forms/ProfileForm.tsx` and `app/profile/page.tsx`
- **Files**: ProfileForm.tsx (modify), profile/page.tsx (modify)
- Add `real_email` and `real_phone` fields and props
- **Verify**: /profile renders with the new fields

### T6 — Smoke tests
- **Apply migration via Supabase dashboard** (user action)
- After migration applied:
  - **Anon signup with real_email + real_phone** → 201, profile has both fields
  - **Anon signup with invalid email** → 5xx with "Email format invalid" error
  - **Anon signup with invalid phone** → 5xx with "Phone format invalid" error
  - **Anon signup without email/phone** → 201, both NULL (backward compat)
  - **Update profile via /profile** with new email → DB updated
- Build / lint / type-check all green

### T7 — Commit
- **Files**: all changed
- Conventional commit: `feat(auth): capture email and phone at registration`
- NO AI attribution
- **Verify**: `git status` clean

## Review Workload Forecast

- **Estimated changed lines**: ~150 (form updates ~80, server action ~30, profile updates ~30, migration ~50)
- **Chained PRs**: No (single PR)
- **Budget risk**: Low
- **Decision needed**: Yes — user must apply the SQL migration via Supabase dashboard before the new fields are captured by the trigger

## Action Type Summary

- **Orchestrator-actions**: T2, T3, T5, T7
- **User-actions**: T1 application via dashboard, T6 visual verification
