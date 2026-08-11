# profile-page Specification

## Purpose

Lets an authenticated user view and edit their own profile fields (`display_name`, `real_phone`, `real_email`). The `cedula` is immutable identity: it MUST NOT be editable on this page (the login resolution depends on it staying constant).

## Requirements

### Requirement: /profile requires authentication

`app/profile/page.tsx` MUST be a Server Component that calls `supabase.auth.getUser()` via the server client. If the response has no user, the page MUST issue a Next.js redirect to `/login?redirect=/profile`.

#### Scenario: anonymous request is redirected to login

- GIVEN an anonymous request
- WHEN the browser navigates to `/profile`
- THEN the response MUST be a redirect to `/login?redirect=/profile`.

#### Scenario: authenticated request renders the page

- GIVEN an authenticated user `U`
- WHEN the browser navigates to `/profile`
- THEN the response MUST be HTTP 200 with the profile form HTML.

### Requirement: Form loads the row for the current user

The page MUST read `SELECT * FROM profiles WHERE id = auth.uid()` via the server client (RLS enforces owner-only reads from Phase 1). The form MUST show inputs bound to `display_name`, `real_phone`, `real_email`. There MUST NOT be a `cedula` input — the field is read-only identity for the account's lifetime.

#### Scenario: page loads the owner's row

- GIVEN an authenticated user `U` whose row has `display_name = "María"`, `real_phone = "+57 300..."`, `real_email = "m@example.com"`
- WHEN `U` navigates to `/profile`
- THEN the inputs MUST render those three values.

#### Scenario: empty profile fields render empty

- GIVEN an authenticated user whose row has NULL `display_name`, `real_phone`, `real_email`
- WHEN they navigate to `/profile`
- THEN the inputs MUST render with empty values.

#### Scenario: no cédula input is rendered

- GIVEN the rendered HTML at `/profile`
- WHEN parsed for an `<input>` whose `name` attribute is `cedula`
- THEN zero such inputs MUST be present.

### Requirement: Server Action updates only the user's own row

A Server Action MUST execute `UPDATE profiles SET display_name = $1, real_phone = $2, real_email = $3 WHERE id = auth.uid()` through the server client. The action MUST NOT include `cedula` in the UPDATE column list.

On success, the page MUST show a Spanish success message: "Perfil actualizado". On any Supabase error, the page MUST show a Spanish error message.

#### Scenario: valid update persists across reload

- GIVEN an authenticated user on `/profile`
- WHEN they submit `display_name = "María"`, `real_phone = "+57 300..."`, `real_email = "m@example.com"`
- THEN the Server Action returns success
- AND a subsequent `SELECT * FROM profiles WHERE id = auth.uid()` shows those three values.

#### Scenario: clearing all fields saves NULLs

- GIVEN an authenticated user with all three fields populated
- WHEN they submit the form with all three inputs empty
- THEN the Server Action sets all three columns to NULL
- AND the page reload shows empty inputs.

#### Scenario: user A cannot update user B

- GIVEN authenticated user `A`
- WHEN `A` somehow submits a Server Action carrying user B's id (best-effort attack via tampering)
- THEN the UPDATE MUST affect zero rows (RLS WHERE clause ties to `auth.uid()`).

### Requirement: Cédula is never written by this action

The Server Action's SQL MUST NOT include `cedula` in any `SET` clause. Apply-phase smoke test MUST inspect the action and assert this.

#### Scenario: action SQL does not touch cedula

- GIVEN the Server Action source
- WHEN statically analyzed for `cedula =` patterns in the SQL string
- THEN zero matches MUST be found (lint-style check or grep smoke test).

### Requirement: Auth-aware nav reflects state

The `/profile` page MUST render the same `<Header />` defined by the `header-nav` capability, reflecting the authenticated state and showing the "Cerrar sesión" action.

#### Scenario: header shows profile/logout when /profile is loaded authenticated

- GIVEN an authenticated user navigates to `/profile`
- WHEN the page renders
- THEN the header MUST show "Mi perfil" and "Cerrar sesión".

### Requirement: Accessibility and Spanish copy

Inputs MUST have `<label htmlFor>` pairings; 44×44 px touch targets; Enter in any text input MUST submit; all copy MUST be Spanish; no emoji.

#### Scenario: form submits on Enter

- GIVEN focus is on the `real_email` input
- WHEN the user presses Enter
- THEN the form submits (Playwright).
