# Phase 7 Technical Design: Polish

## File-by-File

### NEW files

#### `app/not-found.tsx`
```typescript
import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Página no encontrada</h1>
        <p className="text-gray-600 mb-6">
          La ruta que buscás no existe.
        </p>
        <Link
          href="/"
          className="inline-block min-h-[44px] leading-[44px] px-4 text-blue-600 underline"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
```

#### `app/loading.tsx`
```typescript
export default function TopLevelLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <p className="sr-only" aria-live="polite">Cargando…</p>
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
```

### MODIFIED files

#### `app/reports/loading.tsx` — polish to spec
```typescript
export default function Loading() {
  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto">
      <p className="sr-only" aria-live="polite">Cargando reportes…</p>
      <h1 className="text-2xl font-bold mb-4">Personas reportadas como desaparecidas</h1>
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

#### `app/report/[id]/loading.tsx` — polish
```typescript
export default function Loading() {
  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <p className="sr-only" aria-live="polite">Cargando reporte…</p>
      <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse" />
      <div className="h-48 bg-gray-200 rounded-lg mb-4 animate-pulse" />
      <div className="h-72 bg-gray-200 rounded-lg mb-4 animate-pulse" />
    </main>
  );
}
```

#### `app/layout.tsx` — add skip link + `<main id="main">` wrapping
- Add skip link at the very top of `<body>` (before Header):
  ```jsx
  <body>
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-3 focus:py-2 focus:rounded"
    >
      Saltar al contenido principal
    </a>
    <Header />
    {children}  {/* pages should be wrapped in <main id="main"> */}
  </body>
  ```

#### Each page (home, reports, /report/[id], /login, /register, /profile, /report/new)
- Wrap content in `<main id="main">` so the skip link works
- Add `export const metadata = { title: '...' }` (or `generateMetadata` for dynamic routes)

#### `components/ui/SaveButton.tsx` — add aria-pressed
```typescript
<button
  type="button"
  onClick={onClick}
  disabled={isPending}
  aria-pressed={saved}
  className={...}
>
```

#### `components/forms/ReportForm.tsx` — toggle group a11y
- Add `aria-describedby` to the file input pointing to its helper text id
- Fieldset legend already exists; ensure radios have explicit labels

#### `components/forms/CommentForm.tsx` — aria-required
- Add `aria-required="true"` to the body textarea

#### `components/ui/CommentList.tsx`, `SavesList.tsx` — aria-label
- Add `aria-label` to each list item describing the entry

#### `components/map/ReportMap.tsx` — map accessibility
- Add `aria-label="Mapa de ubicación"` to the wrapping `<div>`

## Hard rules

- DO NOT introduce new features
- DO NOT modify DB schema or RLS
- DO NOT use emoji
- All Spanish copy
- 44 px touch targets preserved
- Keep existing layout color (gray-50 bg, blue-600 accents)
- No new dependencies

## Return

Standard sdd-design envelope. Confirm 2 new files (not-found.tsx, loading.tsx) + 6+ modified files.
