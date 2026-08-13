import Link from "next/link";

export const metadata = {
  title: 'Desaparecidos',
  description: 'Plataforma de búsqueda de personas desaparecidas',
};

export default function Home() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-24 gap-6">
      <h1 className="text-4xl font-bold">Hola</h1>
      <p className="text-gray-600 text-center max-w-md">
        Buscá personas reportadas como desaparecidas o ayudá publicando un reporte.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Link
          href="/reports"
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
        >
          Ver reportes
        </Link>
        <Link
          href="/report/new"
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Publicar reporte
        </Link>
      </div>
    </main>
  );
}
