import RegisterForm from '@/components/forms/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear cuenta</h1>
      <RegisterForm />
    </main>
  );
}
