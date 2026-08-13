export default function TopLevelLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <p className="sr-only" aria-live="polite">
        Cargando…
      </p>
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
