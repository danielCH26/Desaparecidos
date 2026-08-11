import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { signOutAction } from '@/app/actions/auth';

export default async function Header() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="border-b bg-white">
      <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
        <Link href="/" className="text-lg font-bold">
          Desaparecidos
        </Link>
        <nav className="flex gap-4 items-center text-sm">
          {user ? (
            <>
              <Link href="/profile" className="hover:underline">
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
              <Link href="/login" className="hover:underline">
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="hover:underline bg-blue-600 text-white px-3 py-2 rounded"
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
