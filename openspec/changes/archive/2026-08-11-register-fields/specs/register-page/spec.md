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
