# Phase 6 Technical Design: Save/Bookmark

## File-by-File

### NEW files

#### `app/actions/saves.ts` (Server Action)
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type Result = { saved: boolean } | { error: string };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function toggleSaveAction(reportId: string, currentSaved: boolean): Promise<Result> {
  if (!UUID_REGEX.test(reportId)) {
    return { error: 'Identificador de reporte inválido' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Iniciá sesión para guardar reportes' };
  }

  // Verify report exists
  const { data: report } = await supabase
    .from('reports')
    .select('id')
    .eq('id', reportId)
    .single();
  if (!report) {
    return { error: 'El reporte ya no existe' };
  }

  if (currentSaved) {
    // DELETE the save
    const { error } = await supabase
      .from('saves')
      .delete()
      .eq('report_id', reportId)
      .eq('profile_id', user.id);
    if (error) {
      return { error: 'No se pudo quitar de guardados' };
    }
    revalidatePath('/profile');
    revalidatePath(`/report/${reportId}`);
    return { saved: false };
  } else {
    // INSERT the save (catch unique constraint race condition)
    const { error } = await supabase
      .from('saves')
      .insert({ report_id: reportId, profile_id: user.id });
    if (error) {
      // 23505 = unique_violation = already saved, treat as success
      if (error.code === '23505') {
        return { saved: true };
      }
      return { error: 'No se pudo guardar el reporte' };
    }
    revalidatePath('/profile');
    revalidatePath(`/report/${reportId}`);
    return { saved: true };
  }
}
```

#### `components/ui/SaveButton.tsx` (Client Component)
```typescript
'use client';

import { useState, useTransition } from 'react';
import { toggleSaveAction } from '@/app/actions/saves';

interface SaveButtonProps {
  reportId: string;
  initialSaved: boolean;
  isAuthed: boolean;
}

export default function SaveButton({ reportId, initialSaved, isAuthed }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isAuthed) return null;

  function onClick() {
    const previousSaved = saved;
    // Optimistic update
    setSaved(!previousSaved);
    setError(null);

    startTransition(async () => {
      const result = await toggleSaveAction(reportId, previousSaved);
      if ('error' in result) {
        // Revert optimistic state
        setSaved(previousSaved);
        setError(result.error);
        return;
      }
      setSaved(result.saved);
    });
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className={
          saved
            ? 'w-full min-h-[44px] border border-blue-600 text-blue-600 bg-white rounded px-4 py-2'
            : 'w-full min-h-[44px] bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50'
        }
      >
        {isPending
          ? 'Guardando…'
          : saved
            ? 'Quitar de guardados'
            : 'Guardar'}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
```

### MODIFIED files

#### `app/report/[id]/page.tsx`
- Import `SaveButton`
- Add the initial saved-state query alongside the existing report fetch
- Render `<SaveButton>` after the contact section

Updated structure:
```typescript
// ... existing report fetch ...

// NEW: query save state for current user
const { data: { user } } = await supabase.auth.getUser();
let initialSaved = false;
if (user) {
  const { data: save } = await supabase
    .from('saves')
    .select('id')
    .eq('report_id', params.id)
    .eq('profile_id', user.id)
    .maybeSingle();
  initialSaved = !!save;
}

// ... existing JSX ...

{/* after the contact section, before comments */}
<SaveButton reportId={params.id} initialSaved={initialSaved} isAuthed={!!user} />

{/* existing comments section */}
```

#### `app/profile/page.tsx`
- Add saves list section after the `<ProfileForm>`
- Section uses a Server Component for the saves list

```typescript
// ... existing code ...

import SavesList from '@/components/ui/SavesList';

// ... in the JSX ...

<ProfileForm ... />

<hr className="my-6" />

<section>
  <h2 className="text-lg font-semibold mb-3">Reportes guardados</h2>
  <SavesList />
</section>
```

#### NEW: `components/ui/SavesList.tsx` (Server Component)
```typescript
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function formatRelative(iso: string, locale: string): string {
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

export default async function SavesList() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/profile');

  const { data: saves } = await supabase
    .from('saves')
    .select(`
      id,
      created_at,
      report:reports!inner (
        id,
        person_name,
        person_age,
        person_photo_url
      )
    `)
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  if (!saves || saves.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        No tenés reportes guardados todavía.{' '}
        <Link href="/reports" className="text-blue-600 underline">
          Volvé a reportes
        </Link>{' '}
        para guardar los que te interesen.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {saves.map((save) => {
        const r = save.report as any;
        return (
          <li key={save.id}>
            <Link
              href={`/report/${r.id}`}
              className="block bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                {r.person_photo_url ? (
                  <img src={r.person_photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-700 font-bold">
                      {r.person_name.slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {r.person_name}
                    {r.person_age !== null && `, ${r.person_age} años`}
                  </p>
                  <p className="text-xs text-gray-500">
                    Guardado {formatRelative(save.created_at, 'es')}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
```

## Hard rules

- DO NOT modify the saves table schema or its RLS (Phase 1 has it)
- DO NOT introduce save count display on /report/[id]
- DO NOT add a separate "Saved" tab on /profile — keep it as a section below the form
- All Spanish copy
- 44 px touch targets
- No emoji
- Server Component for `SavesList` (no interactivity)
- Client Component for `SaveButton` (useTransition + optimistic state)

## Return

Standard sdd-design envelope. Confirm 1 new file (saves.ts) + 1 new file (SaveButton.tsx) + 1 new file (SavesList.tsx) + 2 modified files.
