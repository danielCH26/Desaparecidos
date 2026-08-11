import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Hola</h1>
      <Link
        href="/reports"
        className="text-blue-600 hover:underline text-lg"
      >
        Ver reportes
      </Link>
    </main>
  );
}
