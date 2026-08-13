# apply-progress: register-fields

## Status: BLOCKED

### Tasks Completed
- [x] T1: Created supabase/migrations/0002_register_fields.sql
- [x] T2: Updated app/actions/auth.ts with real_email/real_phone validation
- [x] T3: Updated RegisterForm.tsx with new fields
- [x] T4: Updated register/page.tsx with info banner
- [x] T5: Already done (ProfileForm + profile/page already had fields)

### Blocked
- T6: Smoke tests - **Migration not applied in Supabase**

### Code Changes
- app/actions/auth.ts - Added EMAIL_REGEX, PHONE_REGEX, validation in registerAction
- components/forms/RegisterForm.tsx - Added real_email, real_phone inputs with validation
- app/(auth)/register/page.tsx - Added info banner
- supabase/migrations/0002_register_fields.sql - New file (not applied yet)

### Next Steps
User must apply migration via Supabase dashboard SQL Editor, then re-run apply to complete T6 smoke tests.
