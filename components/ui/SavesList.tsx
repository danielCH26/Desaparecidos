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
        const r = save.report as unknown as { id: string; person_name: string; person_age: number | null; person_photo_url: string | null };
        return (
          <li key={save.id}>
            <Link
              href={`/report/${r.id}`}
              className="block bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                {r.person_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
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
