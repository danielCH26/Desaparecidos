# register-fields Archive Report

## Final State (2026-08-11)

### Outcome
**Success** — register-fields archived. 3 deltas merged into existing main specs + 1 new main spec created. Migration applied to live Supabase. End-to-end verified via REST API smoke tests.

### Tasks Completed
- T1: `supabase/migrations/0002_register_fields.sql` created ✓
- T2: `app/actions/auth.ts` updated (registerAction + updateProfileAction accept email/phone) ✓
- T3: `components/forms/RegisterForm.tsx` updated with email/phone inputs + client validation ✓
- T4: `app/(auth)/register/page.tsx` updated with info banner ✓
- T5: ProfileForm + profile page verified (already had fields) ✓
- T6: 4 smoke tests via REST API all passed ✓
- T7: Committed ✓

### Commits
```
f90eaaf feat(auth): capture email and phone at registration with optional profile editing
99c05df fix(map): make onChange optional in ReportMap to allow read-only usage from Server Components (bug fix during apply)
```

### Smoke Test Results
- **T6.1**: anon signup with `real_email="juan@example.com"` + `real_phone="+57 300 1234567"` → 201, profile row has both fields populated ✓
- **T6.2**: anon signup with invalid email `"not-an-email"` → 500 + "Email format invalid" (trigger raises) ✓
- **T6.3**: anon signup with invalid phone `"abc"` → 500 + "Phone format invalid" ✓
- **T6.4**: anon signup without email/phone → 201, profile row has `real_email=null, real_phone=null` (backward compat) ✓

### Specs Synced
- 3 deltas merged into existing main specs:
  - `openspec/specs/register-page/spec.md` (added real_email + real_phone fields)
  - `openspec/specs/profile-page/spec.md` (added email/phone editing)
  - `openspec/specs/auth-trigger/spec.md` (reads email + phone from metadata, validates format)
- 1 new main spec:
  - `openspec/specs/register-field-info-banner/spec.md` (NEW)

### Bug Fix During Apply
- Fixed: Server Component passing `onChange={() => {}}` function prop to Client Component (Next.js 14 disallows). Made `onChange` optional in `<ReportMap>` and removed from the detail page. Commit `99c05df`.

### Open Items (deferred to Phase 7 polish)
- Email format guidance in placeholder (e.g., "ejemplo@dominio.com")
- Phone format normalization (currently accepts any 7-20 digit string)
- Visual feedback when field is invalid (currently only on submit)

### Next Recommended
Phase 6 (Save/bookmark) — add `<SaveButton>` to `/report/[id]`, `/profile` page with saved list, `toggleSaveAction` Server Action.

### Risks
- **WARNING**: Confirm email must be disabled in Supabase dashboard for production signups (carried over from Phase 2)
- Test users created during smoke tests were cleaned up
