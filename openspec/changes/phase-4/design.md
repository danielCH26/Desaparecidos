# Phase 4 Technical Design: Public Browse + Detail

## Overview

Phase 4 makes the missing-person reports publicly readable. Two new pages (`/reports` list + `/report/[id]` detail), one new reusable component (`<ReportCard>`), and one additive prop on `<ReportMap>` (`readOnly`). All UI copy in Spanish; mobile-first; no pagination (per plan.md MVP constraint).

## Architecture

```
┌──────────────────────────────────────────────────────┐
│ Browser (mobile-first)                              │
│   GET /reports                                        │
│     ↓ (Server Component fetch)                       │
│   Supabase .from('reports').select(...) (anon key)   │
│     ↓                                                │
│   Grid of <ReportCard> (Server Component)            │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Browser                                              │
│   GET /report/[id]                                   │
│     ↓                                                │
│   Server Component: supabase fetch + Map (read-only) │
│     ↓                                                │
│   notFound() if missing                              │
└──────────────────────────────────────────────────────┘
```

## File-by-File Implementation

### NEW files

#### `components/ui/ReportCard.tsx` (Server Component)
```typescript
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ReportSummary } from '@/lib/types';

/**
 * Card used in /reports list.
 * Privacy: this component NEVER renders contact_phone or contact_email
 * (those live in ReportSummary's exclude — typed structurally).
 */
export default async function ReportCard({ report }: { report: ReportSummary }) {
  const supabase = await createSupabaseServerClient();

  // For identified reports, fetch the publisher's display_name
  let publisher: string | null = null;
  if (report.published_by) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', report.published_by)
      .single();
    publisher = data?.display_name ?? null;
  }

  const ageText = report.person_age !== null ? `, ${report.person_age} años` : '';
  const timeAgo = formatRelativeTime(report.created_at, 'es');

  return (
    <Link
      href={`/report/${report.id}`}
      className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow min-h-[44px]"
    >
      {report.person_photo_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={report.person_photo_url}
          alt={`Foto de ${report.person_name}`}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-40 bg-blue-100 flex items-center justify-center">
          <span className="text-4xl text-blue-700 font-bold">
            {report.person_name.slice(0, 1).toUpperCase()}
          </span>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-lg">{report.person_name}{ageText}</h3>
        {report.last_known_address && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {report.last_known_address}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          {publisher ? `Por ${publisher}` : 'Anónimo'} · {timeAgo}
        </p>
      </div>
    </Link>
  );
}

function formatRelativeTime(iso: string, locale: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return rtf.format(-minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');
  const days = Math.floor(hours / 24);
  return rtf.format(-days, 'day');
}
```

#### `app/reports/page.tsx` (Server Component — list)
```typescript
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ReportCard from '@/components/ui/ReportCard';
import Link from 'next/link';
import type { ReportSummary } from '@/lib/types';

export const metadata = { title: 'Reportes — Desaparecidos' };

export default async function ReportsListPage() {
  const supabase = await createSupabaseServerClient();
  const { data: reports } = await supabase
    .from('reports')
    .select('id, person_name, person_age, person_photo_url, last_known_lat, last_known_lng, last_known_address, created_at, status')
    .eq('status', 'missing')
    .order('created_at', { ascending: false });
  // No pagination — MVP fetches all (per plan.md)

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Personas reportadas como desaparecidas</h1>

      {reports && reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r as ReportSummary} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            Aún no hay reportes publicados.
          </p>
          <Link
            href="/report/new"
            className="inline-block min-h-[44px] bg-blue-600 text-white px-6 py-3 rounded"
          >
            ¿Conocés a alguien desaparecido? Publicá un reporte
          </Link>
        </div>
      )}
    </main>
  );
}
```

#### `app/reports/loading.tsx`
```typescript
export default function Loading() {
  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Personas reportadas como desaparecidas</h1>
      <p className="sr-only" aria-live="polite">Cargando reportes…</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
            <div className="w-full h-40 bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
```

#### `app/reports/not-found.tsx`
```typescript
import Link from 'next/link';

export default function ReportsNotFound() {
  return (
    <main className="min-h-screen p-4 max-w-md mx-auto text-center py-12">
      <h1 className="text-2xl font-bold mb-4">Página no encontrada</h1>
      <p className="text-gray-600 mb-6">
        La ruta que buscás no existe.
      </p>
      <Link href="/" className="text-blue-600 underline">
        Volver al inicio
      </Link>
    </main>
  );
}
```

#### `app/report/[id]/page.tsx` (Server Component — detail)
```typescript
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Report } from '@/lib/types';

const ReportMap = dynamic(() => import('@/components/map/ReportMap'), { ssr: false });

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();

  // Fetch the report (RLS allows public SELECT)
  const { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !report) notFound();

  // If identified, fetch publisher's display_name
  let publisherName: string | null = null;
  if (report.published_by) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', report.published_by)
      .single();
    publisherName = data?.display_name ?? null;
  }

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <Link href="/reports" className="text-blue-600 underline text-sm">
        ← Volver a reportes
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-2">
        {report.person_name}{report.person_age !== null ? `, ${report.person_age} años` : ''}
      </h1>

      <p className="text-sm text-gray-500 mb-4">
        Reportado el {new Date(report.created_at).toLocaleDateString('es')}
        {' · '}
        {publisherName ? `Por ${publisherName}` : 'Publicado como anónimo'}
      </p>

      {report.person_photo_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={report.person_photo_url}
          alt={`Foto de ${report.person_name}`}
          className="w-full max-h-96 object-cover rounded-lg mb-4"
        />
      ) : (
        <div className="w-full h-48 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
          <span className="text-6xl text-blue-700 font-bold">
            {report.person_name.slice(0, 1).toUpperCase()}
          </span>
        </div>
      )}

      <ReportMap
        value={{ lat: report.last_known_lat, lng: report.last_known_lng }}
        onChange={() => {}}
        readOnly={true}
      />

      <section className="mt-6 space-y-4">
        {report.last_seen_at && (
          <div>
            <h2 className="text-sm font-medium text-gray-500">Última vez visto</h2>
            <p>{new Date(report.last_seen_at).toLocaleString('es')}</p>
          </div>
        )}

        {report.last_known_address && (
          <div>
            <h2 className="text-sm font-medium text-gray-500">Dirección</h2>
            <p>{report.last_known_address}</p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-medium text-gray-500">Contacto</h2>
          <p><a href={`tel:${report.contact_phone}`} className="text-blue-600 underline">{report.contact_phone}</a></p>
          {report.contact_email && (
            <p className="mt-1"><a href={`mailto:${report.contact_email}`} className="text-blue-600 underline">{report.contact_email}</a></p>
          )}
        </div>
      </section>

      <section className="mt-8 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">Comentarios</h2>
        <p className="text-sm text-gray-500">
          Los comentarios estarán disponibles próximamente. (Phase 5)
        </p>
      </section>
    </main>
  );
}
```

#### `app/report/[id]/loading.tsx`
```typescript
export default function Loading() {
  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse" />
      <div className="h-48 bg-gray-200 rounded-lg mb-4 animate-pulse" />
      <div className="h-72 bg-gray-200 rounded-lg mb-4 animate-pulse" />
    </main>
  );
}
```

#### `app/report/[id]/not-found.tsx`
```typescript
import Link from 'next/link';

export default function ReportNotFound() {
  return (
    <main className="min-h-screen p-4 max-w-md mx-auto text-center py-12">
      <h1 className="text-2xl font-bold mb-4">Reporte no encontrado</h1>
      <p className="text-gray-600 mb-6">
        El reporte que buscás no existe o fue eliminado.
      </p>
      <Link href="/reports" className="text-blue-600 underline">
        Ver todos los reportes
      </Link>
    </main>
  );
}
```

#### `lib/types.ts` (NEW — shared type definitions)
```typescript
/**
 * Privacy-enforced type for report list cards.
 * Excludes contact_phone and contact_email — TS error if leaked.
 */
export interface ReportSummary {
  id: string;
  person_name: string;
  person_age: number | null;
  person_photo_url: string | null;
  last_known_lat: number;
  last_known_lng: number;
  last_known_address: string | null;
  last_seen_at: string | null;
  created_at: string;
  status: 'missing' | 'found' | 'resolved';
  published_by: string | null;
}

/**
 * Full report type for the detail page (includes contact info).
 */
export interface Report extends ReportSummary {
  contact_phone: string;
  contact_email: string | null;
  updated_at: string;
}
```

### MODIFIED files

#### `components/map/ReportMap.tsx` — additive `readOnly` prop

Add a new optional prop `readOnly?: boolean` (default `false`).

When `readOnly` is true:
- `dragging={false}`
- `scrollWheelZoom={false}`
- `doubleClickZoom={false}`
- `touchZoom={false}`
- `keyboard={false}`
- No `useMapEvents` ClickHandler attached
- Still renders the marker (read-only display)

When `readOnly` is `false` (existing behavior in create form): unchanged.

Default `false` preserves Phase 3's `/report/new` smoke test pass.

### Out of scope (NOT modified in Phase 4)
- `app/layout.tsx`: no Header change (existing Header works for anon and authed)
- `lib/supabase/server.ts`: unchanged (existing anon+cookies handles list/detail fetch)
- `lib/supabase/client.ts`: unchanged (not needed for Server-rendered pages)

## Critical Decisions Locked In This Design

1. **Privacy enforced structurally**: `ReportSummary` excludes contact fields. Any future spread of a row into a card yields a TypeScript excess-property error.
2. **No pagination** (per plan.md MVP): the list query fetches all rows. Acceptable up to ~100 reports.
3. **No map at list level**: list shows thumbnails only. Maps are only in detail and create pages.
4. **`readOnly` prop is purely additive**: default `false` preserves Phase 3 behavior.

## Persistence (hybrid mode)
- Save this design to `openspec/changes/phase-4/design.md`
- Engram: `sdd/phase-4/design` (use `capture_prompt: false`)

## Hard rules for apply
- DO NOT modify any existing files except `components/map/ReportMap.tsx` (additive only — adding `readOnly` prop and conditional interactivity).
- Use `createSupabaseServerClient()` for data fetch (anon key handles public SELECT via RLS).
- Status filter defaults to `'missing'` only (forward-compat).
- No client-side state management libraries (no React Query, no useInfiniteQuery, no useSWR).
- No next/image (use plain `<img>` with `loading="lazy"` — simpler).

## Return
Standard sdd-design output envelope. Confirm all 7 new files + 1 modified file match the design above.
