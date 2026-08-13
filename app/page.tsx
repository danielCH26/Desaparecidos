import Link from "next/link";

export const metadata = {
  title: 'Desaparecidos',
  description: 'Plataforma de búsqueda de personas desaparecidas',
};

export default function Home() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-8 gap-6">
      <div className="text-center max-w-2xl space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Ayudá a encontrar a quien reportan como desaparecido
        </h1>
        <p className="text-base sm:text-lg text-gray-700">
          Plataforma gratuita y pública donde familias colombianas comparten
          información sobre personas desaparecidas tras el terremoto del 10 de
          agosto de 2026.
        </p>
        <p className="text-sm sm:text-base text-gray-600 italic">
          Cada reporte, cada comentario, cada dato que compartas puede acercar
          a una familia a su ser querido. Tu ayuda salva vidas.
        </p>
      </div>
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
