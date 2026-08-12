export default function Loading() {
  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Personas reportadas como desaparecidas</h1>
      <p className="sr-only" aria-live="polite">Cargando reportes…</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
            <div className="w-full h-40 bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
