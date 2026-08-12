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
