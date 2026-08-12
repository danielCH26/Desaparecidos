import Link from 'next/link';

export default function ReportNotFound() {
  return (
    <main className="min-h-screen p-4 max-w-md mx-auto text-center py-12">
      <h1 className="text-2xl font-bold mb-4">Reporte no encontrado</h1>
      <p className="text-gray-600 mb-6">
        El reporte que buscás no existe o fue eliminado.
      </p>
      <Link href="/reports" className="text-blue-600 underline">
        Ver todos los reportes
      </Link>
    </main>
  );
}
