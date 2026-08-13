# register-page Specification

## Purpose

Lets a new user create an account identified by their Colombian `cédula` plus a password, on top of the Phase 1 `handle_new_user` trigger. The form constructs the synthetic `{cedula}@example.net` email client-side, calls `signUp`, and relies on the trigger to create the `profiles` row. After this capability lands, every later phase can identify publishers and enforce owner-only updates.

## Requirements

### Requirement: /register route exists

`app/register/page.tsx` MUST be a Server Component shell that renders a `<RegisterForm />` Client Component. The page MUST be reachable anonymously and MUST NOT require a session.

#### Scenario: anonymous user can load /register

- GIVEN an anonymous request
- WHEN the browser navigates to `/register`
- THEN the response MUST be HTTP 200 with an HTML form bound to `/register`.

### Requirement: Form fields and validation

The form MUST have four inputs: `cedula`, `password`, `confirmPassword`, and `displayName` (optional). Client validation MUST run on submit: `cedula` matches `^\d{6,10}$`; `password` ≥ 8 chars; `confirmPassword` equals `password`; `displayName` may be empty.

#### Scenario: non-digit cédula is blocked client-side

- GIVEN a user on `/register`
- WHEN they submit `cedula = "AB123456"`
- THEN the form MUST prevent submission and display "Cédula inválida".

#### Scenario: too-short cédula is blocked client-side

- GIVEN a user on `/register`
- WHEN they submit `cedula = "12345"` (5 chars)
- THEN the form MUST prevent submission and display "Cédula inválida".

#### Scenario: short password is blocked client-side

- GIVEN a user on `/register`
- WHEN they submit `password = "1234567"` (7 chars)
- THEN the form MUST display "La contraseña debe tener al menos 8 caracteres".

#### Scenario: mismatched confirmation is blocked client-side

- GIVEN `password = "abcdefgh"` and `confirmPassword = "abcdefgi"`
- WHEN the form submits
- THEN it MUST display "Las contraseñas no coinciden" and MUST NOT call Supabase.

### Requirement: Successful registration creates user and profile

On a valid submit, the Client Component MUST invoke `supabase.auth.signUp({ email, password, options: { data: { cedula, display_name? } } })` where `email` is `syntheticEmailFor(cedula)`. The Phase 1 trigger `handle_new_user` creates the matching `profiles` row.

After success, the client MUST navigate to `/`.

#### Scenario: valid registration creates auth.users and profiles rows

- GIVEN anonymous user on `/register`
- WHEN they submit `cedula = "12345678"`, `password = "abcdefgh"`, `confirmPassword = "abcdefgh"`, `displayName = "María"`
- THEN `auth.users` contains one row whose email is `12345678@example.net`
- AND `public.profiles` contains one row with `id = auth.users.id`, `cedula = "12345678"`, `display_name = "María"`
- AND the browser ends up at `/`.

#### Scenario: optional display_name omitted saves NULL

- GIVEN anonymous user on `/register`
- WHEN they submit with only cédula + password (no displayName)
- THEN `public.profiles.display_name` MUST be `NULL`
- AND the redirect to `/` MUST happen.

### Requirement: Server-side authoritative validation

A Server Action MUST re-validate `cedula`, `password`, and `confirmPassword` BEFORE invoking Supabase. Client validation is UX; the Server Action is the trust boundary.

#### Scenario: Server Action rejects invalid cédula without calling Supabase

- GIVEN a Server Action that wraps `signUp`
- WHEN it is invoked with `cedula = "12"` (too short)
- THEN it MUST return a validation error and MUST NOT call `supabase.auth.signUp`.

### Requirement: Spanish error messages for known failures

Failed registrations MUST show a Spanish message derived from the Supabase error:

| Supabase error (English fragment) | UI message |
|---|---|
| `User already registered` | `Cédula ya registrada` |
| `Password should be at least 6 characters` | `La contraseña debe tener al menos 8 caracteres` |
| `Email address` + `invalid` | `Cédula inválida` |
| Network/timeout | `Error de conexión, intentá de nuevo` |
| any other | `No pudimos crear tu cuenta. Intentá de nuevo.` |

#### Scenario: duplicate cédula surfaces "Cédula ya registrada"

- GIVEN a profile with `cedula = "12345678"` already exists
- WHEN a new user submits the same cédula + a new password
- THEN the form MUST display "Cédula ya registrada".

#### Scenario: offline submit shows a network message

- GIVEN the browser is offline (network throttled to `Offline`)
- WHEN the form submits valid input
- THEN the form MUST display "Error de conexión, intentá de nuevo".

### Requirement: Accessibility and UX guardrails

Inputs MUST have `<label htmlFor>` pairings; interactive elements MUST hit 44×44 px; tab order MUST follow visual order; Enter in any text input MUST submit; no emoji MAY appear; copy MUST be Spanish.

#### Scenario: keyboard submit works

- GIVEN the form focused on the `confirmPassword` input
- WHEN the user presses Enter
- THEN the form MUST submit exactly as if the submit button were clicked (Playwright).

#### Scenario: labels bound to inputs

- GIVEN the rendered form HTML
- WHEN parsed for `<label htmlFor>` matching each `<input id>`
- THEN every input MUST have a label (snapshot assertion).

## Delta: register-fields (2026-08-11)
# register-page (MODIFIED spec delta)

## What changes from the existing spec

Two new optional form fields added: `real_email` (email input) and `real_phone` (tel input). They appear after `confirmPassword`. Both with Spanish labels, helper text, format validation. The page gains an info banner that disambiguates the email field as "contact info, not a login email".

## Requirements

- **MODIFIED Requirement — Form fields.** The `/register` page MUST render inputs for `cédula`, `displayName` (optional), `password`, `confirmPassword`, `realEmail` (optional), `realPhone` (optional). Each input has a `<label>` linked via `for=`. Real email uses `type="email" autoComplete="email"`. Real phone uses `type="tel" autoComplete="tel"` with placeholder "3001234567".
- **ADDED Requirement — Email field validation (client).** When the user blurs the email field with invalid format, the page MUST show "El correo no es válido" in Spanish near the field. Submit MUST be blocked while invalid.
- **ADDED Requirement — Phone field validation (client).** When the user blurs the phone field with invalid format, the page MUST show "El celular debe tener entre 7 y 20 dígitos" in Spanish near the field. Submit MUST be blocked while invalid.
- **ADDED Requirement — Info banner above form.** Above the form fields, the page MUST render a callout with text "No necesitás email para entrar. Si dejás tu correo y celular acá, te podemos contactar si alguien encuentra a la persona que reportás. Tu cédula sigue siendo tu identificador único." in Spanish.
- **MODIFIED Requirement — Spanish copy throughout.** All new labels and helper text MUST be in Spanish.

## Scenarios

- GIVEN the user is on `/register`
- WHEN the page renders
- THEN an info banner with "No necesitás email para entrar" appears above the form
- AND a `real_email` input appears with `type="email"`, `autoComplete="email"`, Spanish label
- AND a `real_phone` input appears with `type="tel"`, `autoComplete="tel"`, Spanish label, placeholder "3001234567"
- AND the form submit button text is still "Crear cuenta"

- GIVEN the user enters "no-at" in `real_email` and clicks submit
- WHEN client validation runs
- THEN "El correo no es válido" is shown near the email field
- AND submit is blocked

- GIVEN the user enters "abc" in `real_phone` and clicks submit
- WHEN client validation runs
- THEN "El celular debe tener entre 7 y 20 dígitos" is shown near the phone field
- AND submit is blocked
