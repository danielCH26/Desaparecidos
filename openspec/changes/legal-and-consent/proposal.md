# Proposal: legal-and-consent — Legal docs + cookie consent + acceptance

## Intent

Add the legally-required documents and consent flows per Colombian law (Ley 1581 de 2012 — Protección de Datos Personales — and Decreto 1377 de 2013). The site currently has no privacy policy, no terms, no cookie consent, and no acceptance flow. For an MVP serving the August 10, 2026 earthquake emergency, this is a gap that should be closed.

## Context

- The site is public, free, and processes personal data (cédula, email, phone, posted reports, comments).
- Colombia requires consent for personal data processing under Ley 1581.
- Users post reports with photos of missing persons and their own contact info.
- No third-party cookies are used today; the platform is minimal.

## Scope

**In**:

### 1. Three legal documents (static Spanish text)
- `/legal/datos` — Política de Tratamiento de Datos Personales (Ley 1581 de 2012 + Decreto 1377 de 2013)
- `/legal/terminos` — Términos y Condiciones del Servicio
- `/legal/cookies` — Política de Cookies
- All three are public, accessible without authentication
- All three link to each other (footer with cross-links)
- All three are rendered in Spanish

### 2. Cookie consent banner
- Bottom-of-page banner (fixed position)
- Shown on first visit only (stored in `localStorage`)
- Three actions:
  - "Aceptar todas" — stores `localStorage.cookie_consent = "all"`
  - "Solo necesarias" — stores `localStorage.cookie_consent = "essential"`
  - "Personalizar" — expands to show category toggles (functional, analytics) — both off by default; clicking "Guardar" stores the per-category choices
- Banner has 44px+ height for accessibility
- Mobile-friendly (full width, bottom of screen)
- "Cerrar" (×) on the right closes the banner and defaults to "essential only"
- Respects user choice on subsequent visits (does not re-appear)

### 3. Acceptance checkbox on register and login
- On `/register`: required checkbox "Acepto la [Política de Tratamiento de Datos Personales](/legal/datos) y los [Términos y Condiciones](/legal/terminos) del servicio."
- On `/login`: visible checkbox (less prominent, optional — the acceptance was done on register)
- Both link to the legal pages
- Form validation: register form blocks submit if not checked

### 4. Profile migration
- Add column `accepted_terms_at timestamptz` to `profiles`
- Set on register when user accepts
- Read on login (informational only — not blocking)

### 5. Header navigation links
- Add links to `/legal/datos`, `/legal/terminos`, `/legal/cookies` in the Header
- Dropdown menu (responsive) or simple inline links (only 3)
- Plain Spanish labels

## Capabilities

### New
1. **`legal-datos-page`** — `/legal/datos` page: Spanish text per Ley 1581, including responsible, types of data, purposes, user rights (Habeas Data), procedures for exercising rights, security, validity.
2. **`legal-terminos-page`** — `/legal/terminos` page: Spanish text covering service description, user obligations, liability limits, modifications, termination, applicable law.
3. **`legal-cookies-page`** — `/legal/cookies` page: Spanish text on what cookies are, which we use (essential only), which we don't use, how to disable.
4. **`cookie-consent-banner`** — Client Component `components/CookieConsentBanner.tsx` shown on first visit, hidden after choice. Three actions + close. Persists to localStorage. Reads from localStorage on mount to skip if already chosen.
5. **`acceptance-checkbox`** — Reusable Client Component `components/AcceptanceCheckbox.tsx` for forms. Props: `checked`, `onChange`, optional `disabled`. Renders checkbox with linked Spanish text.
6. **`legal-nav-links`** — Header updates to include links to the 3 legal pages.

### Modified
7. **`register-page`** — Add `<AcceptanceCheckbox />` before the submit button. Required.
8. **`register-action`** — Validate acceptance in `createRegisterAction` (new function name? or refactor existing `registerAction`?). Block if not accepted. Set `accepted_terms_at = now()` in profile after signup.
9. **`login-page`** — Add `<AcceptanceCheckbox />` (optional, less prominent).
10. **`migration-acceptance`** — `supabase/migrations/0005_acceptance.sql`: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepted_terms_at timestamptz;`
11. **`profile-page`** — Show a small line "Aceptaste los términos el {date}" if `accepted_terms_at` is set.

## Approach

- **Legal pages**: static Server Components with Spanish text in MDX-like format. No CMS needed for MVP.
- **Cookie consent**: localStorage-based, no DB needed. Banner hides after first choice.
- **Acceptance tracking**: column on `profiles`. Set on register. Read on profile page for transparency. Not blocking login (we don't want to lose users over a checkbox).
- **Layout**: legal pages at `/legal/{datos,terminos,cookies}`. Same `<main id="main">` wrap as other pages.
- **Header**: add a sub-section or dropdown for "Legal" → 3 links. Keep simple — inline links if width permits, else hamburger.
- **Email content for register**: no change. Welcome email is out of MVP (no email pipeline).

## Default decisions

1. **Legal pages are static, hardcoded** in the file (not DB-loaded). Easier to deploy and review.
2. **Cookie consent uses localStorage only**, not cookies (to avoid the consent paradox). Stored per browser, per origin.
3. **Cookie categories for MVP**: just "Esenciales" (always on) + a no-op "Funcionales" + a no-op "Analíticas" (because the site has none). The toggle is there for future-proofing.
4. **Acceptance on login is optional**, not required (since the user already accepted at register). The checkbox is just a reminder.
5. **No re-acceptance on terms updates** (out of MVP scope). If the user wants to force re-acceptance, that's a future feature.
6. **Header links to legal pages** are visible to all users (anon + authed), at the END of the nav (right-most position).
7. **No "Política de Privacidad" as separate document** — folded into "Datos Personales".
8. **No cookie banner in the dev server** (only in production) — out of scope; would need a separate env var. The banner is in the layout; it just shows.

## Open questions (defaults encoded; user can override)

1. **Acceptance text exact wording**: default: simple "Acepto la Política...". User can override to more legalese.
2. **Cookie banner position**: default: bottom-fixed. User can override to top or modal.
3. **Header layout for legal links**: default: inline links (3 small links). User can override to dropdown.
4. **Send acceptance email confirmation**: default: no (no email pipeline). User can override.

## Persistence

- Engram `sdd/legal-and-consent/proposal`
- OpenSpec `openspec/changes/legal-and-consent/proposal.md` (this file)
- `capture_prompt: false`

## Hard rules

- DO NOT use any third-party services (no Cookiebot, no Iubenda, no Termly)
- DO NOT use cookies that process personal data beyond what's strictly needed (no analytics, no marketing)
- DO NOT send acceptance emails (no email pipeline)
- All Spanish copy
- 44px touch targets
- No emoji
- All legal documents must be authored in Spanish

## Next

`sdd-spec` to detail the 6 capabilities + 5 modified files.
