import { createSupabaseServerClient } from '@/lib/supabase/server';
import ReportCard from '@/components/ui/ReportCard';
import ReportsFilterBar from '@/components/reports/ReportsFilterBar';
import Link from 'next/link';
import { isValidDepartment, isValidMunicipality } from '@/lib/colombia-divipola';
import type { ReportSummary } from '@/lib/types';

export const metadata = { title: 'Reportes — Desaparecidos' };

type SearchParams = Promise<{
  department?: string;
  municipality?: string;
  ageMin?: string;
  ageMax?: string;
}>;

export default async function ReportsListPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const supabase = await createSupabaseServerClient();

  // Parse and validate search params
  const departmentParam = searchParams.department;
  const municipalityParam = searchParams.municipality;
  const ageMinParam = searchParams.ageMin;
  const ageMaxParam = searchParams.ageMax;

  const department = departmentParam && isValidDepartment(departmentParam) ? departmentParam : null;
  const municipality = department && municipalityParam && isValidMunicipality(department, municipalityParam) ? municipalityParam : null;

  let ageMin: number | undefined;
  if (ageMinParam) {
    const parsed = parseInt(ageMinParam, 10);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 130) {
      ageMin = parsed;
    }
  }

  let ageMax: number | undefined;
  if (ageMaxParam) {
    const parsed = parseInt(ageMaxParam, 10);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 130) {
      ageMax = parsed;
    }
  }

  const hasFilters = department || municipality || ageMin !== undefined || ageMax !== undefined;

  // Build query with filters
  let query = supabase
    .from('reports')
    .select('id, person_name, person_age, person_photo_url, last_known_lat, last_known_lng, last_known_address, created_at, status, department, municipality, published_by')
    .eq('status', 'missing')
    .order('created_at', { ascending: false });

  if (department) {
    query = query.eq('department', department).not('department', 'is', null);
  }
  if (municipality) {
    query = query.eq('municipality', municipality).not('municipality', 'is', null);
  }
  if (ageMin !== undefined) {
    query = query.gte('person_age', ageMin);
  }
  if (ageMax !== undefined) {
    query = query.lte('person_age', ageMax);
  }

  const { data: reports } = await query;
  // No pagination — MVP fetches all (per plan.md)

  const filterCount = reports?.length ?? 0;

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Personas reportadas como desaparecidas</h1>

      <div className="flex justify-end mb-4">
        <Link
          href="/report/new"
          className="inline-flex items-center min-h-[44px] px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Publicar reporte
        </Link>
      </div>

      <ReportsFilterBar
        current={{
          department,
          municipality,
          ageMin: ageMin !== undefined ? String(ageMin) : null,
          ageMax: ageMax !== undefined ? String(ageMax) : null,
        }}
      />

      {hasFilters && (
        <p className="text-sm text-gray-600 mb-4">
          Mostrando {filterCount} reporte{filterCount !== 1 ? 's' : ''}
        </p>
      )}

      {reports && reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r as ReportSummary} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {hasFilters ? 'No hay reportes que coincidan con los filtros.' : 'Aún no hay reportes publicados.'}
          </p>
          {hasFilters ? (
            <Link
              href="/reports"
              className="inline-block min-h-[44px] text-blue-600 underline px-6 py-3"
            >
              Limpiar filtros
            </Link>
          ) : (
            <Link
              href="/report/new"
              className="inline-block min-h-[44px] bg-blue-600 text-white px-6 py-3 rounded"
            >
              ¿Conocés a alguien desaparecido? Publicá un reporte
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
