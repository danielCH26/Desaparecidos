import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { signOutAction } from '@/app/actions/auth';

export default async function Header() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="border-b bg-white">
      <div className="max-w-4xl mx-auto p-4 flex justify-between items-center gap-4">
        <Link href="/" className="text-lg font-bold shrink-0">
          Desaparecidos
        </Link>
        <nav className="flex gap-3 items-center text-sm flex-wrap justify-end">
          <Link
            href="/report/new"
            className="inline-flex items-center min-h-[44px] px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Publicar reporte
          </Link>
          <Link
            href="/legal/datos"
            className="hover:underline min-h-[44px] inline-flex items-center"
          >
            Legal
          </Link>
          {user ? (
            <>
              <Link href="/profile" className="hover:underline min-h-[44px] inline-flex items-center">
                Mi perfil
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="hover:underline min-h-[44px] px-2"
                >
                  Cerrar sesión
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline min-h-[44px] inline-flex items-center">
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="hover:underline bg-blue-100 text-blue-700 px-3 py-2 rounded min-h-[44px] inline-flex items-center"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
