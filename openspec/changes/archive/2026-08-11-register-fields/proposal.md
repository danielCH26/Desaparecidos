# Proposal: register-fields — Improve registration with email and phone capture

## Intent

Phase 2 captured only cédula + password (and optional display_name). The new spec adds email and phone fields to the register form so the system captures this contact info at signup time, not via a separate /profile step. The data flows through the auth trigger to the `profiles` table.

## Context

Per the user's feedback after they tested Phase 2 registration:
- They disabled "Confirm email" in Supabase dashboard ✓
- They want the form to capture `real_email` and `real_phone` at signup
- They want this without breaking the synthetic-email auth pattern (the user logs in with cédula, not email)

## Scope

**In**:
- Add `real_email` (optional, validated format) to `/register` form
- Add `real_phone` (optional, validated format) to `/register` form
- Server Action `registerAction` reads both fields, includes them in `options.data` for signUp
- Auth trigger `handle_new_user()` reads `email` and `phone` from `raw_user_meta_data`, inserts them into `profiles.real_email` and `profiles.real_phone`
- Update `/profile` page to show the saved email/phone (already has display_name editing; just need to surface real_email/real_phone too)
- Update `lib/types.ts` with the new fields in `ProfileSummary` / `ReportSummary` if needed

**Out**:
- Email notifications (still no email pipeline per Phase 1)
- SMS notifications (still no SMS per Phase 1)
- Email/SMS verification of the provided contact info (no infra)
- Phone format normalization to E.164 (just validate it's plausible; let the user enter any string)
- Changing the synthetic email strategy (still use `${cedula}@example.net` for Supabase Auth)

## Capabilities

### Modified

1. **`register-page`**: Add two fields to `/register/page.tsx`'s form:
   - `real_email` (email input, optional, autocomplete="email")
   - `real_phone` (tel input, optional, autocomplete="tel", placeholder "3001234567")
   - Both with Spanish labels and helper text
   - Both with client-side format validation

2. **`register-action`**: `app/actions/auth.ts` `registerAction` reads new fields, includes them in `options.data`, validates format server-side (authoritative)

3. **`auth-trigger`** (DB migration): Update `handle_new_user()` in `supabase/migrations/0001_init.sql` to read `email` and `phone` from `raw_user_meta_data` and insert into `profiles.real_email` / `profiles.real_phone`. **Requires a new migration file** `supabase/migrations/0002_register_fields.sql`.

4. **`profile-page`**: Update `/profile` to also display and edit `real_email` and `real_phone` (it currently only edits `display_name`).

### New

5. **`register-field-info-banner`**: Add an info banner on `/register` explaining the email field is OPTIONAL contact info, NOT a login email. Login uses cédula.

## Approach

- **Auth flow stays synthetic**: still `signUp({ email: '${cedula}@example.net', password, options: { data: { cedula, display_name, real_email, real_phone } } })`
- **Profile gets real data**: trigger reads metadata and inserts into profiles columns (real_email, real_phone are already NOT NULL columns per Phase 1 schema)
- **Format validation**:
  - Email: standard regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - Phone: minimal regex `/^\+?[\d\s-]{7,20}$/` (allows Colombian mobile with country code)
- **Optional by default**: user can leave both empty. UX-wise they're at the end of the form.

## Approach to migrations

**Auth trigger migration**:

```sql
-- supabase/migrations/0002_register_fields.sql
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cedula text := NEW.raw_user_meta_data->>'cedula';
  v_display_name text := NEW.raw_user_meta_data->>'display_name';
  v_real_email text := NEW.raw_user_meta_data->>'real_email';
  v_real_phone text := NEW.raw_user_meta_data->>'real_phone';
BEGIN
  IF v_cedula IS NULL OR v_cedula !~ '^[0-9]{6,10}$' THEN
    RAISE EXCEPTION 'Cédula missing or malformed';
  END IF;
  IF v_real_email IS NOT NULL AND v_real_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN
    RAISE EXCEPTION 'Email format invalid';
  END IF;
  IF v_real_phone IS NOT NULL AND v_real_phone !~ '^\+?[\d\s-]{7,20}$' THEN
    RAISE EXCEPTION 'Phone format invalid';
  END IF;
  INSERT INTO public.profiles (id, cedula, display_name, real_email, real_phone)
  VALUES (NEW.id, v_cedula, NULLIF(v_display_name, ''), NULLIF(v_real_email, ''), NULLIF(v_real_phone, ''));
  RETURN NEW;
END; $$;
```

The `display_name` field is already being passed in Phase 2 (`options.data: { cedula, display_name }`) but the trigger doesn't read it. This migration adds the read.

## Open questions

1. **Email required or optional**: required (better data) or optional (less friction)? Default: optional (consistent with display_name).
2. **Phone required or optional**: same. Default: optional.
3. **Email/phone validation strictness**: just regex check, or also send verification code? Default: regex only (no infra for sending).
4. **/profile display order**: real_email/real_phone above or below display_name? Default: display_name first (matches existing layout), real_email/real_phone below.
5. **Existing users**: how to handle existing profiles without real_email/real_phone? Default: they stay NULL (DB allows it); /profile shows them as empty fields; no backfill.

## Persistence

- Engram topic `sdd/register-fields/proposal`
- OpenSpec `openspec/changes/register-fields/proposal.md` (this file)
- `capture_prompt: false`

## Hard rules

- DO NOT change the synthetic email strategy
- DO NOT add email notifications or verification
- DO NOT introduce server-side phone format normalization beyond regex
- All Spanish UI copy
- 44 px touch targets

## Next

`sdd-spec` to write the detailed delta spec for the 5 capabilities.
