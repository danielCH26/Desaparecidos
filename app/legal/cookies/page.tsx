import Link from 'next/link';

export const metadata = {
  title: 'Política de Cookies — Desaparecidos',
  description: 'Cómo usamos cookies y tecnologías similares en Desaparecidos',
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto prose prose-sm">
      <h1 className="text-3xl font-bold mb-2">Política de Cookies</h1>
      <p className="text-sm text-gray-500 mb-6">
        Última actualización: 13 de agosto de 2026
      </p>

      <Section title="¿Qué son las cookies?">
        <p>
          Las cookies son pequeños archivos de texto que un sitio web
          almacena en tu dispositivo cuando lo visitás. Sirven para recordar
          información entre visitas (por ejemplo, mantenerte conectado).
        </p>
      </Section>

      <Section title="¿Qué cookies usamos?">
        <p>
          <strong>Desaparecidos</strong> utiliza únicamente cookies{' '}
          <strong>estrictamente necesarias</strong> para que el servicio
          funcione:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Cookies de autenticación (Supabase):</strong> mantienen tu
            sesión iniciada mientras usás la plataforma. Sin estas cookies no
            podrías mantenerte logueado entre páginas.
          </li>
          <li>
            <strong>Cookies de seguridad (CSRF token):</strong> protegen contra
            ataques de falsificación de solicitudes.
          </li>
        </ul>
        <p className="mt-2">
          Estas cookies son <strong>imprescindibles</strong> y no pueden
          desactivarse sin romper el servicio.
        </p>
      </Section>

      <Section title="¿Qué cookies NO usamos?">
        <p>
          <strong>Desaparecidos</strong> es una plataforma mínima y <strong>no
          utiliza</strong>:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Cookies de análisis</strong> (Google Analytics, Mixpanel,
            etc.) — no rastreamos tu comportamiento.
          </li>
          <li>
            <strong>Cookies de marketing o publicidad</strong> (Meta Pixel,
            Google Ads, etc.) — no mostramos publicidad.
          </li>
          <li>
            <strong>Cookies de redes sociales</strong> (Facebook, Twitter,
            etc.) — los botones de compartir usan links simples, no
            iframes.
          </li>
          <li>
            <strong>Cookies de terceros en general</strong> — todos los
            recursos se sirven desde nuestro propio dominio.
          </li>
        </ul>
      </Section>

      <Section title="Consentimiento">
        <p>
          Cuando visitás <strong>Desaparecidos</strong> por primera vez, te
          mostramos un banner de cookies. Podés elegir:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Aceptar todas</strong> — actualmente equivalente a
            &ldquo;Solo necesarias&rdquo; ya que no usamos cookies opcionales.
          </li>
          <li>
            <strong>Solo necesarias</strong> — solo cookies de sesión
            (imprescindibles).
          </li>
          <li>
            <strong>Personalizar</strong> — elegí categoría por categoría.
          </li>
        </ul>
        <p className="mt-2">
          Tu elección se guarda en tu navegador (no en una cookie) y no se
          vuelve a mostrar a menos que la borres manualmente.
        </p>
      </Section>

      <Section title="¿Cómo desactivar las cookies?">
        <p>
          La mayoría de los navegadores web permiten bloquear o eliminar
          cookies a través de su configuración. Buscá la sección de
          &quot;Privacidad&quot; o &quot;Cookies&quot; en tu navegador.
        </p>
        <p>
          <strong>Importante:</strong> si desactivás las cookies necesarias,
          el servicio no podrá mantenerte conectado y tendrás que iniciar
          sesión cada vez que cambies de página.
        </p>
      </Section>

      <Section title="Cambios a esta política">
        <p>
          Podemos actualizar esta política para reflejar cambios en el
          servicio. Te avisaremos por los medios de contacto registrados.
        </p>
      </Section>

      <Section title="Más información">
        <p>
          Para más detalles sobre cómo tratamos tus datos personales, consultá
          nuestra{' '}
          <Link href="/legal/datos" className="text-blue-600 underline">
            Política de Tratamiento de Datos Personales
          </Link>{' '}
          y nuestros{' '}
          <Link href="/legal/terminos" className="text-blue-600 underline">
            Términos y Condiciones
          </Link>
          .
        </p>
      </Section>

      <nav className="mt-8 pt-4 border-t flex flex-wrap gap-4 text-sm">
        <Link href="/legal/datos" className="text-blue-600 underline">
          Política de Datos Personales
        </Link>
        <Link href="/legal/terminos" className="text-blue-600 underline">
          Términos y Condiciones
        </Link>
        <Link href="/" className="text-blue-600 underline">
          Volver al inicio
        </Link>
      </nav>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="text-gray-800 space-y-2">{children}</div>
    </section>
  );
}
