import Link from 'next/link';

export default function ReportsNotFound() {
  return (
    <main className="min-h-screen p-4 max-w-md mx-auto text-center py-12">
      <h1 className="text-2xl font-bold mb-4">Página no encontrada</h1>
      <p className="text-gray-600 mb-6">
        La ruta que buscás no existe.
      </p>
      <Link href="/" className="text-blue-600 underline">
        Volver al inicio
      </Link>
    </main>
  );
}
