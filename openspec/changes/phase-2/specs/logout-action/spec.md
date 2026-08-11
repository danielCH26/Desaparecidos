# logout-action Specification

## Purpose

Defines the Server Action that ends a session. It MUST run on the server (clearing cookies is server authority) and then redirect home. The header's "Cerrar sesión" button is the primary caller.

## Requirements

### Requirement: signOutAction exists as a Server Action

`app/_actions/auth.ts` MUST export an async function annotated with `"use server"`, named `signOutAction`, that takes no arguments.

#### Scenario: action is marked server-only

- GIVEN `app/_actions/auth.ts`
- WHEN the file is read
- THEN the first non-blank, non-comment line MUST be the literal `"use server"`.

#### Scenario: action callable from a form

- GIVEN a `<form action={signOutAction}>` rendered in the header
- WHEN the user submits it
- THEN the function MUST execute on the server (Next.js logs would show no client-side fetch of Supabase `signOut`).

### Requirement: Action signs out via the server client

Inside `signOutAction`, the code MUST invoke `supabase.auth.signOut()` on the server client (anon + cookies, per `auth-client-wiring`). It MUST NOT use the service-role key — service role cannot revoke a user's session because cookies are tied to anon-authenticated sessions.

After `signOut` resolves, the action MUST call Next's `redirect('/')`.

#### Scenario: sign-out clears the Supabase auth cookies

- GIVEN an authenticated user with Supabase auth cookies set
- WHEN `signOutAction` runs and the redirect response is produced
- THEN the response headers MUST contain `Set-Cookie` directives that clear the Supabase auth cookies (Playwright: read `document.cookie` or response headers after submit).

#### Scenario: final navigation lands on /

- GIVEN the action completes
- WHEN the browser follows the redirect
- THEN the URL MUST be `/`.

### Requirement: No client-only sign-out path

The logout flow MUST NOT depend on `supabase.auth.signOut()` being called from the browser. The Server Action alone MUST end the session. This guarantees logout works when JavaScript is disabled (defense in depth).

#### Scenario: logout works with JavaScript disabled

- GIVEN an authenticated user with JS disabled
- WHEN the `<form action={signOutAction}>` is submitted via the native browser
- THEN the response clears the auth cookies and lands on `/` (Playwright with `--disable-javascript`).

### Requirement: Header re-renders anonymous state after redirect

After the redirect, the page rendered at `/` MUST use the `header-nav` anonymous branch (links to `/login` and `/register`).

#### Scenario: header switches to anonymous after logout

- GIVEN an authenticated user on `/`
- WHEN they submit the logout form
- THEN the page at `/` after the redirect MUST show "Iniciar sesión" and "Registrarse" (and MUST NOT show "Mi perfil" or "Cerrar sesión").

### Requirement: Action is safe to call multiple times

Calling `signOutAction` when there is no active session MUST still complete without throwing a user-visible error. The redirect to `/` MUST still happen.

#### Scenario: repeated logout calls do not error

- GIVEN an anonymous session
- WHEN `signOutAction` is invoked
- THEN the function MUST resolve to the `/` redirect (Playwright: page navigates home with no console error).

### Requirement: Error surface

If `supabase.auth.signOut()` throws (e.g., network failure), `signOutAction` MUST NOT swallow the error silently — it MUST propagate to Next.js's error boundary, which displays an error page. The action MUST NOT redirect on failure (a partially-cleared session could leave the user in a broken state).

#### Scenario: failed signOut does not redirect

- GIVEN `supabase.auth.signOut()` rejects with an error (network mocked to fail)
- WHEN the action runs
- THEN the action MUST reject (Playwright asserts an error boundary is shown, NOT a navigation to `/`).
