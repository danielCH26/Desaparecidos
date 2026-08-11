import LoginForm from '@/components/forms/LoginForm';

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
      <LoginForm redirect={params.redirect ?? '/'} />
    </main>
  );
}
