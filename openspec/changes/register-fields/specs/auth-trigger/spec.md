# auth-trigger (MODIFIED spec delta)

## What changes from the existing spec

The `handle_new_user()` Postgres function is extended to read two more keys from `raw_user_meta_data`: `real_email` (passed-through to `profiles.real_email`) and `real_phone` (passed-through to `profiles.real_phone`). It also now reads `display_name` (which Phase 2 already passes in metadata but the trigger ignores — the delta also captures that).

Validation rules tighten: `real_email` and `real_phone` are optional, but if present they MUST match their format regex. If invalid, the trigger MUST raise and the signup MUST fail.

## Requirements

- **MODIFIED Requirement — Function shape.** The trigger MUST insert into `public.profiles` with all five fields populated from `raw_user_meta_data`: `id`, `cedula`, `display_name` (nullable), `real_email` (nullable), `real_phone` (nullable).
- **ADDED Requirement — Email format check.** When `raw_user_meta_data->>'real_email'` is non-null and non-empty, it MUST match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Otherwise the trigger MUST `RAISE EXCEPTION 'Email format invalid'`.
- **ADDED Requirement — Phone format check.** When `raw_user_meta_data->>'real_phone'` is non-null and non-empty, it MUST match `/^\+?[\d\s-]{7,20}$/`. Otherwise the trigger MUST `RAISE EXCEPTION 'Phone format invalid'`.
- **MODIFIED Requirement — Cédula format check (unchanged)** — `/^[0-9]{6,10}$/` still required.
- **MODIFIED Requirement — Idempotency.** Same: function is `SECURITY DEFINER`, called by the `AFTER INSERT ON auth.users` trigger. Re-running is idempotent only via UNIQUE constraints (still `cedula` UNIQUE).

## Scenarios

- GIVEN a new auth.users row with `raw_user_meta_data = { cedula: '12345670', real_email: 'juan@example.com', real_phone: '+57 300 1234567' }`
- WHEN the trigger fires
- THEN `public.profiles` has a row with `id = NEW.id`, `cedula = '12345670'`, `real_email = 'juan@example.com'`, `real_phone = '+57 300 1234567'`, `display_name = NULL`

- GIVEN a new auth.users row with `raw_user_meta_data = { cedula: '12345671', real_email: 'no-at' }`
- WHEN the trigger fires
- THEN the trigger RAISES EXCEPTION 'Email format invalid' and no profile row is inserted

- GIVEN a new auth.users row with `raw_user_meta_data = { cedula: '12345672', real_phone: 'abc' }`
- WHEN the trigger fires
- THEN the trigger RAISES EXCEPTION 'Phone format invalid'

- GIVEN a new auth.users row with `raw_user_meta_data = { cedula: '12345673' }` (no email, no phone)
- WHEN the trigger fires
- THEN `profiles.real_email` and `profiles.real_phone` are NULL
