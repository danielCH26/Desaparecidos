import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Página no encontrada</h1>
        <p className="text-gray-600 mb-6">
          La ruta que buscás no existe.
        </p>
        <Link
          href="/"
          className="inline-block min-h-[44px] leading-[44px] px-4 text-blue-600 underline"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
