# auth-trigger Specification

## Purpose

Defines the Postgres trigger that creates a `public.profiles` row automatically whenever a new row is inserted into `auth.users`. The trigger reads the cédula from `raw_user_meta_data`, validates it against the same digit-only / 6-to-10-character rule enforced by `profiles.cedula`'s CHECK constraint, and fails fast when the metadata is missing or malformed. After this trigger runs, every authenticated user is identifiable by UUID everywhere downstream — the synthetic `{cedula}@desaparecidos.local` email is constructed client-side and is not this trigger's concern.

## Requirements

### Requirement: handle_new_user Function Exists

The migration MUST create a function `public.handle_new_user()` that returns `trigger` and is marked `SECURITY DEFINER` so it can insert into `profiles` even when the calling role lacks direct INSERT permission.

The function body MUST:

1. Read `NEW.raw_user_meta_data->>'cedula'` into a local variable.
2. If the variable is NULL or does not match the digit-only / 6-to-10-character pattern, raise an exception so the parent `auth.users` insert fails.
3. Otherwise, `INSERT INTO public.profiles (id, cedula) VALUES (NEW.id, v_cedula);`.
4. Return `NEW`.

#### Scenario: trigger inserts a matching profile on signup

- GIVEN the migration has been applied and a synthetic email `{cedula}@desaparecidos.local` would be constructed client-side
- WHEN a row is inserted into `auth.users` with `raw_user_meta_data = jsonb_build_object('cedula', '12345678')`
- THEN a row exists in `public.profiles` with `id = NEW.id` and `cedula = '12345678'`.

#### Scenario: trigger rejects signup with missing cédula

- GIVEN the migration has been applied
- WHEN a row is inserted into `auth.users` with `raw_user_meta_data = '{}'::jsonb`
- THEN the insert into `auth.users` fails (the trigger raises an exception).

#### Scenario: trigger rejects signup with non-digit cédula

- GIVEN the migration has been applied
- WHEN a row is inserted into `auth.users` with `raw_user_meta_data->>'cedula' = 'AB123456'`
- THEN the insert into `auth.users` fails.

#### Scenario: trigger rejects signup with too-short cédula

- GIVEN the migration has been applied
- WHEN a row is inserted into `auth.users` with `raw_user_meta_data->>'cedula' = '12345'`
- THEN the insert into `auth.users` fails.

### Requirement: Trigger Wired to auth.users

The migration MUST install the trigger:

```
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### Scenario: trigger fires on every auth.users insert

- GIVEN the trigger is installed
- WHEN two rows are inserted into `auth.users`, each with a valid `cedula` in metadata
- THEN two new rows exist in `public.profiles`, one per `auth.users.id`, and the profile count equals the `auth.users` insert count for that batch.

### Requirement: Profile Identity Is UUID-Canonical

After the trigger runs, the application MUST treat `auth.uid()` (UUID) as the canonical identifier for the user. The `profiles.cedula` column is a login-resolution field only; it MUST NOT be used as a cross-table join key.

#### Scenario: profiles.id matches auth.users.id

- GIVEN a user signs up and the trigger runs
- WHEN `SELECT id FROM profiles WHERE cedula = '12345678'` runs
- THEN the returned `id` MUST equal the corresponding `auth.users.id` and MUST be a UUID.

#### Scenario: cedula is not a foreign key target

- GIVEN the migration has been applied
- WHEN `information_schema.table_constraints` is queried for any constraint on any Phase 1 table whose column is `cedula`
- THEN no `REFERENCES` constraint MUST reference `profiles.cedula` (it is referenced only by the login flow, not by FK).
