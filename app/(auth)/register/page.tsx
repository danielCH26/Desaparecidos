import RegisterForm from '@/components/forms/RegisterForm';

export const metadata = {
  title: 'Registrarse — Desaparecidos',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear cuenta</h1>
      <aside
        className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4"
        role="note"
      >
        No necesitás email para entrar. Si dejás tu correo y celular acá, te
        podemos contactar si alguien encuentra a la persona que reportás. Tu
        cédula sigue siendo tu identificador único.
      </aside>
      <RegisterForm />
    </main>
  );
}
