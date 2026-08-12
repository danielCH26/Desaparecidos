# Phase 5 Technical Design: Comments

## File-by-File Plan

### NEW files

#### `lib/types.ts` (extend with Comment)
```typescript
export interface CommentSummary {
  id: string;
  body: string;
  author_id: string | null;
  created_at: string;
}

export interface CommentWithAuthor extends CommentSummary {
  author_display_name: string | null; // null when author_id is null (anonymous)
}
```

#### `components/forms/CommentForm.tsx` (Client Component)
```typescript
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { createCommentAction } from '@/app/actions/comments';
import type { CommentFormState } from '@/app/actions/comments';

const MAX_BODY = 2000;

export default function CommentForm({ reportId, isAuthed }: { reportId: string; isAuthed: boolean }) {
  const [body, setBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (body.trim().length < 1) {
      setError('El comentario no puede estar vacío');
      return;
    }
    if (body.length > MAX_BODY) {
      setError(`El comentario no puede tener más de ${MAX_BODY} caracteres`);
      return;
    }

    const fd = new FormData();
    fd.append('body', body);
    fd.append('reportId', reportId);
    fd.append('isAnonymous', String(isAnonymous));

    startTransition(async () => {
      const result = await createCommentAction(undefined, fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setBody('');
      setSuccess(true);
      // Soft-scroll to comments list (or to the new comment when we add an id)
      const list = document.getElementById('comments-list');
      list?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const charsRemaining = MAX_BODY - body.length;

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="comment-body" className="block text-sm font-medium mb-1">
          Tu comentario
        </label>
        <textarea
          id="comment-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={MAX_BODY}
          placeholder="Si tenés información sobre esta persona, dejala acá. Mantené el respeto."
          className="w-full border rounded px-3 py-2 min-h-[88px]"
        />
        <p className={`text-xs mt-1 ${charsRemaining < 100 ? 'text-orange-600' : 'text-gray-500'}`}>
          {body.length}/{MAX_BODY}
        </p>
      </div>

      <fieldset className="border rounded p-3">
        <legend className="text-sm font-medium px-2">¿Cómo querés firmar?</legend>
        <label className="flex items-center gap-2 py-1">
          <input
            type="radio"
            name="anonToggle"
            checked={isAnonymous}
            onChange={() => setIsAnonymous(true)}
          />
          <span>Como anónimo</span>
        </label>
        <label className="flex items-center gap-2 py-1">
          <input
            type="radio"
            name="anonToggle"
            checked={!isAnonymous}
            disabled={!isAuthed}
            onChange={() => setIsAnonymous(false)}
          />
          <span>
            Identificarme
            {!isAuthed && (
              <> (<Link href={`/login?redirect=/report/${reportId}`} className="text-blue-600 underline">iniciá sesión primero</Link>)</>
            )}
          </span>
        </label>
      </fieldset>

      {error && (
        <p role="alert" className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </p>
      )}
      {success && !error && (
        <p role="status" className="text-green-600 text-sm bg-green-50 p-2 rounded">
          Comentario publicado
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || body.trim().length === 0}
        className="w-full min-h-[44px] bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {isPending ? 'Publicando…' : 'Comentar'}
      </button>
    </form>
  );
}
```

#### `components/ui/CommentList.tsx` (Server Component)
```typescript
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { CommentWithAuthor } from '@/lib/types';

function formatRelative(iso: string, locale: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'hace un momento';
  if (minutes < 60) return rtf.format(-minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');
  const days = Math.floor(hours / 24);
  return rtf.format(-days, 'day');
}

export default async function CommentList({ reportId }: { reportId: string }) {
  const supabase = await createSupabaseServerClient();
  const { data: comments } = await supabase
    .from('comments')
    .select('id, body, author_id, created_at')
    .eq('report_id', reportId)
    .order('created_at', { ascending: true });

  // Batch fetch author display_names
  const authorIds = Array.from(new Set((comments ?? []).map((c) => c.author_id).filter((id): id is string => !!id)));
  const authorMap = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', authorIds);
    for (const p of profiles ?? []) {
      if (p.display_name) authorMap.set(p.id, p.display_name);
    }
  }

  const list: CommentWithAuthor[] = (comments ?? []).map((c) => ({
    id: c.id,
    body: c.body,
    author_id: c.author_id,
    created_at: c.created_at,
    author_display_name: c.author_id ? authorMap.get(c.author_id) ?? null : null,
  }));

  return (
    <div id="comments-list" className="space-y-3">
      {list.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          Sin comentarios todavía. Sé el primero en comentar.
        </p>
      ) : (
        list.map((c) => (
          <article key={c.id} className="border-l-4 border-blue-200 pl-3 py-2">
            <p className="whitespace-pre-wrap text-sm">{c.body}</p>
            <p className="text-xs text-gray-500 mt-1">
              {c.author_id ? `Por ${c.author_display_name ?? 'usuario'}` : 'Anónimo'}
              {' · '}
              {formatRelative(c.created_at, 'es')}
            </p>
          </article>
        ))
      )}
    </div>
  );
}
```

#### `app/actions/comments.ts` (Server Action)
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type CommentFormState = { error: string } | undefined;

const MAX_BODY = 2000;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createCommentAction(
  _prev: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  const body = String(formData.get('body') ?? '').trim();
  const reportId = String(formData.get('reportId') ?? '').trim();
  const isAnonymous = String(formData.get('isAnonymous') ?? '') === 'true';

  if (body.length < 1 || body.length > MAX_BODY) {
    return { error: 'El comentario debe tener entre 1 y 2000 caracteres' };
  }
  if (!UUID_REGEX.test(reportId)) {
    return { error: 'Identificador de reporte inválido' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const authorId: string | null = isAnonymous ? null : (user?.id ?? null);
  if (!isAnonymous && !user) {
    return { error: 'Iniciá sesión para identificarte' };
  }

  // Verify the report exists
  const { data: reportExists } = await supabase
    .from('reports')
    .select('id')
    .eq('id', reportId)
    .single();
  if (!reportExists) {
    return { error: 'El reporte ya no existe' };
  }

  const { error } = await supabase
    .from('comments')
    .insert({
      report_id: reportId,
      body,
      author_id: authorId,
    });

  if (error) {
    return { error: 'No se pudo publicar el comentario, intenta de nuevo' };
  }

  revalidatePath(`/report/${reportId}`);
  return undefined;
}
```

### MODIFIED files

#### `app/report/[id]/page.tsx` (replace the comments section)
- Add a server-side fetch of comments at the top of the page (alongside the report fetch)
- Pass `comments` and `isAuthed` props to the new section
- Replace the "Comentarios" placeholder with:
  ```tsx
  <section className="mt-8 border-t pt-4">
    <h2 className="text-lg font-semibold mb-3">Comentarios</h2>
    <CommentForm reportId={params.id} isAuthed={!!user} />
    <h3 className="text-sm font-medium text-gray-500 mt-6 mb-2">Conversación</h3>
    <CommentList reportId={params.id} />
  </section>
  ```

## Hard rules

- DO NOT modify `comments` table or RLS (Phase 1 has it)
- DO NOT introduce edit/delete UI
- `revalidatePath` after insert is the only mechanism for refreshing the list (no client-side state)
- Server Component for `CommentList` (no interactivity); Client Component for `CommentForm` (toggle + form)
- All Spanish copy
- 44 px touch targets

## Return

Standard sdd-design envelope. Confirm 3 new files + 1 modified file.
