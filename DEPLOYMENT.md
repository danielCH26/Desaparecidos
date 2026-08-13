# Deployment Guide

## Overview

Desaparecidos is deployed as a Next.js 14 app on Vercel's free tier, connected to a Supabase project for database, auth, and storage.

## Stack

- **Hosting**: Vercel (free tier, automatic GitHub integration)
- **Domain**: `*.vercel.app` (Vercel default subdomain; no custom domain for MVP)
- **Database / Auth / Storage**: Supabase (free tier)
- **Source**: `https://github.com/danielCH26/Desaparecidos`

## First-time deploy (one-time)

### 1. Push to GitHub

```bash
cd /home/daniel/desaparecidos
git push origin main
```

(Requires authentication — use the PAT or SSH key configured in your git credentials.)

### 2. Create Vercel project

1. Go to <https://vercel.com/signup> and sign in with GitHub
2. Click **Add New Project** → **Import** the `danielCH26/Desaparecidos` repo
3. Vercel auto-detects Next.js. Don't change the build settings.
4. Click **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://nmklamwiiehfjtpsqwbo.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (the anon key from your Supabase dashboard)
   - `SUPABASE_SERVICE_ROLE_KEY` = (the service role key from your Supabase dashboard)
5. Click **Deploy**

Vercel will build and deploy in ~1-2 minutes. The URL will be `https://desaparecidos-<hash>.vercel.app`.

### 3. Verify the production URL

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://desaparecidos-<hash>.vercel.app/
curl -sS -o /dev/null -w "%{http_code}\n" https://desaparecidos-<hash>.vercel.app/reports
```

Both should return 200.

### 4. Update the live URL

Edit this file (`DEPLOYMENT.md`) and add the live URL to the header. Commit and push.

## Subsequent deploys

Push to main → Vercel auto-deploys:

```bash
git push origin main
```

No manual action needed. Vercel watches the repo.

## Environment variables

| Variable | Scope | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | server only (never exposed to client) | Same — keep secret |

## Production smoke test

After deploy, run the canonical user flow:

1. **Anon**: open the URL → cookie banner shows, click "Solo necesarias"
2. **Anon**: navigate to `/reports` → empty state with CTA
3. **Register**: create account with `cédula 12345678`, password `TestPassword123!`, `department=Antioquia`, `municipality=Medellín`
4. **Login** with same credentials
5. **Publish a report**: navigate to `/report/new`, fill in name="Juan", age=30, drop a pin on the map, contact phone, add a photo
6. **Detail page**: navigate to `/report/<uuid>` → should see the report
7. **Comments**: log out, navigate to the report, post an anon comment
8. **Saved**: log back in, click "Guardar" → navigate to `/profile` → see the report in "Reportes guardados"
9. **Filters**: on `/reports`, filter by `?department=Antioquia` → see the report

## Rollback

If a deploy breaks something:
1. Go to Vercel dashboard → Deployments
2. Click the previous successful deployment
3. Click "Promote to Production"

## Custom domain (deferred)

Per plan.md, custom domain is out of MVP scope. The `*.vercel.app` subdomain is sufficient for emergency response.
