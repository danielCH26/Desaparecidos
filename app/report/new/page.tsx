import { createSupabaseServerClient } from '@/lib/supabase/server';
import ReportForm from '@/components/forms/ReportForm';

export const metadata = {
  title: 'Publicar reporte — Desaparecidos',
};

export default async function ReportNewPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();
    displayName = profile?.display_name ?? null;
  }

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Publicar reporte de persona desaparecida
      </h1>
      {user ? (
        <p className="text-sm text-gray-700 mb-4">
          Hola, {displayName ?? 'familia o comunidad'}. Estás publicando como <strong>identificado</strong>.
        </p>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
          <p className="text-sm">
            Estás publicando como <strong>anónimo</strong>. Iniciá sesión para adjuntar fotos.
          </p>
        </div>
      )}
      <ReportForm isAuthed={!!user} />
    </main>
  );
}
