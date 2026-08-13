# metadata-exports (NEW)

## Purpose

Add Next.js `metadata` exports to all public-facing pages for browser tab titles, social share previews, and SEO (even though we don't formally care about SEO, browser tabs need titles).

## Requirements

- `app/page.tsx` (home): `export const metadata = { title: 'Desaparecidos', description: 'Plataforma de búsqueda de personas desaparecidas' };`
- `app/reports/page.tsx` (already has from Phase 4): keep `{ title: 'Reportes — Desaparecidos' }`
- `app/report/[id]/page.tsx`: export `generateMetadata({ params })` that fetches the report's `person_name` and returns `{ title: \`${personName} — Desaparecidos\`, description: \`Reporte de persona desaparecida\` }`. If fetch fails, fall back to `{ title: 'Reporte — Desaparecidos' }`.
- `app/(auth)/register/page.tsx`: `export const metadata = { title: 'Registrarse — Desaparecidos' };`
- `app/(auth)/login/page.tsx`: same pattern, `Iniciar sesión`.
- `app/profile/page.tsx`: same, `Mi perfil`.
- `app/report/new/page.tsx`: same, `Publicar reporte`.
- All titles follow the pattern "Title — Desaparecidos" (or "Title" for the home).
- Descriptions: short Spanish sentences, max 160 chars.

## Scenarios

- GIVEN the user is on the home page
- WHEN they check the browser tab
- THEN the title is "Desaparecidos"

- GIVEN the user is on `/report/<uuid>` for a report named "Juan Pérez"
- WHEN they check the browser tab
- THEN the title is "Juan Pérez — Desaparecidos"

- GIVEN the user is on `/login`
- WHEN they check the browser tab
- THEN the title is "Iniciar sesión — Desaparecidos"
