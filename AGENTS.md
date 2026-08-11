# AGENTS.md — Desaparecidos

Project-specific instructions for AI coding agents. Complements any global agent config.

## Project overview

A free, public web platform for families and communities to report and search for missing persons after the August 10, 2026 earthquake in Colombia. MVP must ship fast on $0/month infrastructure.

- `plan.md` — mission, features, architecture, data model, success criteria
- `roadmap.md` — phases, milestones, SDD alignment, open questions

## Tech stack

- **Framework**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend / DB / Auth / Storage**: Supabase (Postgres + Auth + Storage, free tier)
- **Hosting**: Vercel (Hobby/free)
- **Maps**: Leaflet + OpenStreetMap (no API key)
- **Methodology**: SDD + RDD

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
```

## Required environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-side only, never expose to client
```

Copy `.env.example` to `.env.local`. Get values from the Supabase project dashboard.

## Project structure

```
app/                  # Next.js App Router
  page.tsx            # home
  report/
    new/              # form to publish
    [id]/             # detail page
  reports/            # list
  login/              # cédula login
  register/           # cédula registration
  profile/            # user profile + saved list
components/
  forms/              # ReportForm, CommentForm
  map/                # ReportMap (Leaflet, client only)
  ui/                 # cards, buttons, skeletons, toasts
lib/
  supabase/
    client.ts         # browser client (anon key)
    server.ts         # RSC cookie client
    types.ts          # generated from DB schema
supabase/
  migrations/         # SQL migrations
```

## Conventions

- **UI copy**: Spanish. All user-facing strings, labels, errors, placeholders.
- **Code / comments / identifiers**: English.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`). No "Co-Authored-By" or AI attribution.
- **No emoji** unless explicitly requested.
- **Accessibility**: Semantic HTML, keyboard nav, 44px touch targets minimum.
- **Mobile-first**: Test at 375 px width.

## Constraints

- **Free tier only**. Stay within: Vercel Hobby, Supabase 500 MB DB + 1 GB storage.
- **No email pipeline**. Supabase Auth email confirmation disabled. Synthetic `@desaparecidos.local` email is internal only.
- **No SMS**. Phone numbers stored as plain text.
- **Web only**. No native mobile app in MVP.
- **No authority integration**. No APIs to police, Red Cross, or government.

## Data model

Four tables in `public`:

- `profiles` — extends `auth.users` (cedula UNIQUE, display_name, real_phone, real_email)
- `reports` — person_name, person_age, person_photo_url, last_known_lat/lng/address, contact_phone, status='missing', published_by (nullable for anonymous)
- `comments` — body, report_id, author_id (nullable for anonymous)
- `saves` — profile_id, report_id (composite unique)

RLS enabled on all tables. See `plan.md` § Data model for exact policies.

## Methodology

This project uses **SDD** (`proposal → spec → design → tasks → apply → verify → archive`) and **RDD** (every PR produces a review receipt).

- All non-trivial changes go through SDD artifacts in Engram (primary) + OpenSpec files in `openspec/` (mirror).
- PRs over 600 lines require explicit approval before proceeding.
- The orchestrator owns the workflow. Phase agents (`sdd-explore`, `sdd-propose`, etc.) own execution.

## Common tasks

- **Add a page**: create under `app/<route>/page.tsx`. Server Component by default; Client only when needed (forms, maps, auth state).
- **Add a DB column**: SQL migration in `supabase/migrations/`, update `lib/supabase/types.ts`, document in `plan.md`.
- **Add a RLS policy**: SQL migration + smoke test from both anonymous and authenticated contexts.
- **Upload a photo**: client-side, direct to Supabase Storage `report-photos` bucket under RLS.

## Do NOT

- Add email or SMS integrations.
- Create a custom backend server (use Vercel serverless functions or Supabase directly).
- Add analytics or third-party scripts.
- Use a different auth provider than Supabase Auth.
- Store photos anywhere other than the `report-photos` bucket.

## Smoke test (pre-deploy)

```bash
npm run build && npm run lint && npm run type-check
```

In a browser:

1. Register a new account with a fake cédula.
2. Log in.
3. Submit a report with a photo and a map pin.
4. Comment on the report (both anonymous and identified).
5. Save the report and view the saved list.
6. Open an incognito window: see all reports, comment anonymously.

Production URL must pass this checklist before declaring MVP done.
