import { notFound } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import CommentForm from '@/components/forms/CommentForm';
import CommentList from '@/components/ui/CommentList';

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
  const { data: { user } } = await supabase.auth.getUser();

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
        <h2 className="text-lg font-semibold mb-3">Comentarios</h2>
        <CommentForm reportId={params.id} isAuthed={!!user} />
        <h3 className="text-sm font-medium text-gray-500 mt-6 mb-2">Conversación</h3>
        <CommentList reportId={params.id} />
      </section>
    </main>
  );
}
