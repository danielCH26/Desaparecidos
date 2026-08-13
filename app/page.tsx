import Link from "next/link";

export const metadata = {
  title: 'Desaparecidos',
  description: 'Plataforma de búsqueda de personas desaparecidas',
};

export default function Home() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Hola</h1>
      <Link
        href="/reports"
        className="text-blue-600 hover:underline text-lg min-h-[44px] inline-flex items-center"
      >
        Ver reportes
      </Link>
    </main>
  );
}
