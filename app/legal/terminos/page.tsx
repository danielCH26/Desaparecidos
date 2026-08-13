import Link from 'next/link';

export const metadata = {
  title: 'Términos y Condiciones — Desaparecidos',
  description: 'Reglas de uso de la plataforma Desaparecidos',
};

export default function TerminosPage() {
  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto prose prose-sm">
      <h1 className="text-3xl font-bold mb-2">Términos y Condiciones</h1>
      <p className="text-sm text-gray-500 mb-6">
        Última actualización: 13 de agosto de 2026
      </p>

      <p className="mb-4">
        Al usar <strong>Desaparecidos</strong> aceptás estos términos.
        Leélos con atención.
      </p>

      <Section title="1. Sobre el servicio">
        <p>
          <strong>Desaparecidos</strong> es una plataforma gratuita y pública
          para publicar y buscar reportes de personas desaparecidas, en el
          contexto de la emergencia causada por el terremoto del 10 de agosto
          de 2026 en Colombia.
        </p>
        <p>
          El servicio se ofrece <strong>tal cual</strong>, sin garantías
          expresas o implícitas. No garantizamos disponibilidad continua ni
          exactitud de los datos publicados por terceros.
        </p>
      </Section>

      <Section title="2. Lo que podés hacer">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Publicar reportes de personas desaparecidas con información
            verídica.
          </li>
          <li>
            Comentar reportes existentes con información útil (testimonios,
            avistamientos, etc.).
          </li>
          <li>
            Guardar reportes en tu perfil para referencia futura.
          </li>
          <li>
            Contactar a quienes publicaron reportes (por los medios que ellos
            proporcionaron).
          </li>
        </ul>
      </Section>

      <Section title="3. Lo que no podés hacer">
        <p>Está estrictamente prohibido:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Publicar reportes falsos, malintencionados o con información que
            sabés incorrecta. Esto puede tener consecuencias legales.
          </li>
          <li>
            Acosar, amenazar o insultar a otras personas usuarias.
          </li>
          <li>
            Publicar contenido que infrinja derechos de terceros (copyright,
            privacidad, imagen, etc.).
          </li>
          <li>
            Intentar acceder a datos de otros usuarios sin autorización.
          </li>
          <li>
            Sobrecargar la plataforma con tráfico automatizado (bots,
            scraping masivo, etc.).
          </li>
          <li>
            Usar la plataforma para cualquier fin ilegal según la ley
            colombiana.
          </li>
        </ul>
      </Section>

      <Section title="4. Contenido que publicás">
        <p>
          Vos sos el único responsable del contenido que publiques. No
          verificamos ni garantizamos la exactitud de los reportes.
        </p>
        <p>
          Si publicás información falsa o difamatoria, podés ser responsable
          civil y penalmente según la ley colombiana.
        </p>
        <p>
          Nos reservamos el derecho de eliminar cualquier contenido que
          viole estos términos o la ley aplicable, sin previo aviso.
        </p>
      </Section>

      <Section title="5. Limitación de responsabilidad">
        <p>
          <strong>Desaparecidos</strong> es una plataforma técnica. No somos
          responsables de:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            La veracidad o exactitud de los reportes publicados por otros
            usuarios.
          </li>
          <li>
            Los contactos que hagas con otras personas a través de la
            plataforma.
          </li>
          <li>
            Decisiones tomadas con base en la información publicada.
          </li>
          <li>
            Interrupciones del servicio, pérdida de datos o cualquier daño
            derivado del uso.
          </li>
        </ul>
      </Section>

      <Section title="6. Privacidad">
        <p>
          El tratamiento de tus datos personales se rige por nuestra{' '}
          <Link href="/legal/datos" className="text-blue-600 underline">
            Política de Tratamiento de Datos Personales
          </Link>
          .
        </p>
      </Section>

      <Section title="7. Cookies">
        <p>
          Para más información sobre cookies, consultá nuestra{' '}
          <Link href="/legal/cookies" className="text-blue-600 underline">
            Política de Cookies
          </Link>
          .
        </p>
      </Section>

      <Section title="8. Modificaciones">
        <p>
          Podemos modificar estos términos en cualquier momento. Te avisaremos
          por los canales de contacto registrados con al menos 15 días de
          anticipación. Si seguís usando el servicio después de esa fecha,
          entendemos que aceptás los nuevos términos.
        </p>
      </Section>

      <Section title="9. Suspensión o terminación">
        <p>
          Podemos suspender o eliminar tu cuenta si:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Violás estos términos o la ley aplicable.</li>
          <li>Publicás contenido claramente falso o dañino.</li>
          <li>
            La plataforma deja de operar (por ejemplo, una vez finalizada la
            emergencia).
          </li>
        </ul>
      </Section>

      <Section title="10. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República de Colombia.
          Cualquier disputa será resuelta por los tribunales competentes de
          Colombia.
        </p>
      </Section>

      <nav className="mt-8 pt-4 border-t flex flex-wrap gap-4 text-sm">
        <Link href="/legal/datos" className="text-blue-600 underline">
          Política de Datos Personales
        </Link>
        <Link href="/legal/cookies" className="text-blue-600 underline">
          Política de Cookies
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
