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
