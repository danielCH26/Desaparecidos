export default function Loading() {
  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse" />
      <div className="h-48 bg-gray-200 rounded-lg mb-4 animate-pulse" />
      <div className="h-72 bg-gray-200 rounded-lg mb-4 animate-pulse" />
    </main>
  );
}
