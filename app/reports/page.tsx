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
