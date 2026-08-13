import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/forms/ProfileForm';
import SavesList from '@/components/ui/SavesList';

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/profile');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('display_name, real_phone, real_email')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return (
      <main className="min-h-screen p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Mi perfil</h1>
        <p role="alert" className="text-red-600">
          No se pudo cargar tu perfil.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mi perfil</h1>
      <ProfileForm
        displayName={profile.display_name ?? ''}
        realPhone={profile.real_phone ?? ''}
        realEmail={profile.real_email ?? ''}
      />

      <hr className="my-6" />

      <section>
        <h2 className="text-lg font-semibold mb-3">Reportes guardados</h2>
        <SavesList />
      </section>
    </main>
  );
}
