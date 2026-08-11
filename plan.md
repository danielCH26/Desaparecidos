# Plan: Desaparecidos

## Mission

A free, public platform for families and communities to report and search for missing persons after the August 10, 2026 earthquake in Colombia.

## Context

A major earthquake struck Colombia on August 10, 2026, displacing thousands of people and severing normal communication channels. In the first 72 hours, families and friends need a fast, low-friction way to publish "missing person" notices with a photo, identity, and last known location — and to find notices posted by others.

Traditional channels (phone hotlines, paper flyers) scale poorly and fragment fast. A public web app, accessible from any phone with a browser, lets a relative in Bogotá publish a notice while a community helper in a rural municipality tries to identify a person they found. The platform must work on mobile data, accept anonymous reports to protect sensitive cases, and not require email infrastructure that may be unreliable in a disaster zone.

The MVP ships within hours, not weeks. Everything is built on free tiers so the platform remains available for the full duration of the humanitarian response without a sponsor.

## Target users

- **Families and friends of a missing person.** They publish the report, often from a phone, sometimes under emotional pressure. They may or may not have an account.
- **Community helpers.** Volunteers, neighbors, local leaders. They browse reports, leave comments with possible sightings, and share posts on WhatsApp/social media.
- **People who found someone.** They search the reports list to see if a found person matches any notice. (For MVP, they leave a comment; a dedicated "found person" flow is out of scope.)

## Core features

- **Report a missing person** — form with photo upload, person name, age, last known location (click on a map to drop a pin), and a public contact phone.
- **Anonymous or identified publishing** — the publisher chooses at submit time. Identified publishing requires a logged-in account; anonymous publishing does not store a publisher id.
- **Cédula-based account** — registration and login use Colombian national ID (`cédula`) as username plus a password. No email verification. The account profile also stores a real phone and a real email (optional, private to the owner).
- **Browse and view reports** — public list and detail pages. Anyone can view without an account.
- **Comments on reports** — anyone can comment, anonymous or with the commenter's account. Comments appear publicly on the report.
- **Save / bookmark a report** — logged-in users only. A "saved" list lives in their profile.

## Tech stack

| Component | Choice | Reason |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) | Server components keep the client bundle small; Vercel-native deploy; mature React ecosystem |
| Styling | Tailwind CSS | Fast utility-first styling, no design tokens debate, plays well with mobile-first |
| Hosting | Vercel (Hobby) | Free tier, zero-config Next.js deploy, automatic preview URLs, edge cache |
| Database | Supabase Postgres (free tier) | Managed Postgres with Row Level Security, 500 MB free — enough for MVP |
| Auth | Supabase Auth | Email+password provider, RLS-aware, free tier; we use a synthetic `{cedula}@desaparecidos.local` email internally |
| File storage | Supabase Storage | 1 GB free, integrated RLS, public bucket for report photos |
| Maps | Leaflet + OpenStreetMap tiles | No API key, no quota, works offline-friendly, mobile-tested |
| Photo upload | Direct browser-to-Supabase upload | Serverless-friendly, no Next.js API route cost |
| CI / linting | ESLint + `next lint` (Next default) | No extra service, runs in CI and locally |

Total monthly cost: **$0** on all free tiers.

## Architecture overview

```
                         Browser (mobile-first)
                                 |
                                 v
                +-----------------------------------+
                |   Next.js 14 (Vercel Hobby)       |
                |                                   |
                |   /app        (RSC + Tailwind)    |
                |     /login    /register           |
                |     /reports  /report/[id]        |
                |     /report/new                   |
                |     /profile                      |
                |                                   |
                |   /components                     |
                |     map/ReportMap.tsx  (Leaflet)   |
                |     forms/ReportForm.tsx           |
                |     forms/CommentForm.tsx          |
                |     ui/  (cards, buttons, etc.)    |
                |                                   |
                |   /lib/supabase                   |
                |     client.ts   (browser)         |
                |     server.ts   (RSC + cookies)   |
                +-----------------+-----------------+
                                  |
                                  v
                +-----------------------------------+
                |   Supabase (free tier)            |
                |                                   |
                |   Auth    (cédula + password)     |
                |   Postgres + RLS                  |
                |     profiles  reports             |
                |     comments  saves               |
                |   Storage  (report-photos bucket) |
                +-----------------------------------+
```

- Server components fetch public data directly via the Supabase server client.
- Client components are limited to: the Leaflet map, forms (photo upload, submit), and auth state.
- No Next.js API routes in MVP — all writes go directly from the browser to Supabase under RLS.

## Data model

All tables live in the Supabase Postgres schema `public`. UUID primary keys, `timestamptz` timestamps.

### `profiles`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | Foreign key to `auth.users(id)`; created via trigger on signup |
| `cedula` | `text` UNIQUE NOT NULL | Colombian national ID; also the login username |
| `display_name` | `text` | Optional public name shown on identified reports and comments |
| `real_phone` | `text` | Private; never shown publicly |
| `real_email` | `text` | Private; never shown publicly |
| `created_at` | `timestamptz` | Default `now()` |

RLS: `SELECT` only by the row owner. No public read.

### `reports`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `person_name` | `text` NOT NULL | |
| `person_age` | `int` | Optional |
| `person_photo_url` | `text` | Path in `report-photos` storage bucket. Nullable: anonymous reports publish without a photo (storage rejects anon uploads). |
| `last_known_lat` | `double precision` NOT NULL | |
| `last_known_lng` | `double precision` NOT NULL | |
| `last_known_address` | `text` | Free-text description (e.g. "Barrio San Antonio, Pereira") |
| `last_seen_at` | `timestamptz` | Optional |
| `contact_phone` | `text` NOT NULL | Public contact for sightings |
| `contact_email` | `text` | Optional public contact |
| `status` | `text` NOT NULL DEFAULT `'missing'` | `missing` only in MVP; `found` reserved for v2 |
| `published_by` | `uuid` FK `profiles(id)` | NULL when published anonymously |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

RLS: `SELECT` public. `INSERT` allowed when `(published_by IS NULL)` OR `(published_by = auth.uid())`.

### `comments`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `report_id` | `uuid` FK `reports(id)` NOT NULL | |
| `author_id` | `uuid` FK `profiles(id)` | NULL when posted anonymously |
| `body` | `text` NOT NULL | |
| `created_at` | `timestamptz` | |

RLS: `SELECT` public. `INSERT` allowed when `(author_id IS NULL)` OR `(author_id = auth.uid())`.

### `saves`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `profile_id` | `uuid` FK `profiles(id)` NOT NULL | |
| `report_id` | `uuid` FK `reports(id)` NOT NULL | |
| `created_at` | `timestamptz` | |

Composite unique constraint on `(profile_id, report_id)`.

RLS: `SELECT`, `INSERT`, `DELETE` only by the row owner (`profile_id = auth.uid()`).

### Auth trick: cédula as login

Supabase Auth requires an email-shaped identifier. We use a synthetic internal email of the form `{cedula}@desaparecidos.local`. The real user email is stored separately on `profiles.real_email` and never sent through Supabase's email pipeline (which is disabled in this project). Sign-up triggers a Postgres function that creates the matching `profiles` row.

## Constraints

- **Free tier only.** $0/month. No paid services, no API keys that require billing.
- **MVP scope.** No over-engineering. Every feature must serve an active missing-persons case.
- **Time pressure.** Ship within hours of starting implementation. Reusable patterns over clever abstractions.
- **No email.** Outgoing email is not configured. Supabase Auth email confirmation is disabled. The synthetic `@desaparecidos.local` email is never delivered.
- **No SMS.** Phone numbers are stored as plain text; no outbound SMS.
- **Web only.** No native mobile app in MVP. Mobile web is the target.
- **Spanish UI.** All user-facing copy is Spanish. Code, comments, and docs are English.
- **No authority coordination.** No integrations with police, government, or NGO systems.

## Out of scope (for MVP)

- Found-person flow (dedicated UI; "found" status reserved in schema only)
- Status transitions (`missing` → `found` → `resolved`) and notifications
- Email or SMS notifications
- Authority / moderator dashboard
- AI face matching across photos
- Map clustering and high-density rendering (MVP renders plain pins)
- Advanced search, filtering, or full-text search beyond Supabase default
- Multi-language UI (Spanish only)
- Account recovery (password reset requires manual DB intervention in MVP)
- Rate limiting beyond Supabase defaults
- Analytics, telemetry, or third-party scripts
- Accessibility audit beyond keyboard nav and semantic HTML
- Custom domain (Vercel default subdomain only)

## Methodology

This project uses two complementary practices:

- **SDD (Spec-Driven Development).** Every non-trivial change goes through `proposal → spec → design → tasks → apply → verify → archive`. Artifacts live in Engram for cross-session continuity. The spec is the source of truth; code is the proof.
- **RDD (Receipt-Driven Development).** The native review pipeline emits a receipt per merged work unit. Receipts are committed alongside code so reviewers can verify scope, risk, and change size without re-running the diff.

For MVP speed, we collapse multiple small changes into one batched `tasks` artifact and apply them in one PR, but each PR still produces a receipt.

## Success criteria

The MVP is "done" when all of the following hold:

1. A user without an account can submit a missing-person report with photo, name, age, map pin, and a contact phone, anonymously.
2. A user with a `cédula`-based account can submit the same report identified, and the report shows their `display_name`.
3. A user without an account can browse all reports and open a detail page showing the photo, map, contact, and all comments.
4. A user with an account can comment on a report identified, and can post a comment anonymously by clearing the "show my name" toggle.
5. A user with an account can save a report and see it in their profile's saved list; logging out removes the saved list; logging in restores it.
6. The app is deployed on Vercel and reachable at its preview URL. No 500s on the happy path. Mobile-first layout works at 375 px width.
7. All tables have RLS enabled with policies matching the rules above. Anonymous Supabase keys have no write access beyond the public `INSERT` paths.
8. A smoke-test run on production URL passes: register → login → submit report → comment → save → browse.
