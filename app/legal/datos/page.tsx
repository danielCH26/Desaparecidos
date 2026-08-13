import Link from 'next/link';

export const metadata = {
  title: 'Política de Tratamiento de Datos Personales — Desaparecidos',
  description: 'Cómo recolectamos, usamos y protegemos tu información personal',
};

export default function DatosPersonalesPage() {
  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto prose prose-sm">
      <h1 className="text-3xl font-bold mb-2">
        Política de Tratamiento de Datos Personales
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Última actualización: 13 de agosto de 2026
      </p>

      <p className="mb-4">
        <strong>Desaparecidos</strong> respeta tu privacidad y se compromete a
        proteger tu información personal de acuerdo con la{' '}
        <strong>Ley 1581 de 2012</strong> (Protección de Datos Personales) y el{' '}
        <strong>Decreto 1377 de 2013</strong> de Colombia. Este documento explica
        qué datos recolectamos, cómo los usamos y cuáles son tus derechos.
      </p>

      <Section title="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de tus datos personales es el
          equipo operador de la plataforma <strong>Desaparecidos</strong>. Para
          cualquier consulta sobre tus datos, podés contactarnos a través de
          los canales indicados al final de este documento.
        </p>
      </Section>

      <Section title="2. Datos que recolectamos">
        <p>Recolectamos los siguientes tipos de datos personales:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Identificación:</strong> cédula (documento nacional de
            identidad colombiano) — usada como identificador único de
            autenticación.
          </li>
          <li>
            <strong>Contacto:</strong> correo electrónico y número de celular
            (opcionales) — para que personas con información sobre personas
            desaparecidas puedan contactarte.
          </li>
          <li>
            <strong>Nombre público:</strong> nombre a mostrar (opcional) —
            visible si decidís identificarte.
          </li>
          <li>
            <strong>Contenido publicado:</strong> reportes de personas
            desaparecidas (nombre, edad, descripción, ubicación, foto) y
            comentarios — visibles públicamente para ayudar en la búsqueda.
          </li>
          <li>
            <strong>Datos técnicos:</strong> dirección IP, agente de navegador,
            marcas de tiempo — para seguridad y prevención de abuso.
          </li>
          <li>
            <strong>Preferencias:</strong> reportes guardados (marcadores) —
            visibles solo en tu perfil.
          </li>
        </ul>
      </Section>

      <Section title="3. Finalidades del tratamiento">
        <p>Usamos tus datos personales para:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Prestar el servicio:</strong> publicar y buscar reportes de
            personas desaparecidas en el contexto de la emergencia causada
            por el terremoto del 10 de agosto de 2026 en Colombia.
          </li>
          <li>
            <strong>Autenticación:</strong> verificar tu identidad cuando
            ingresás a tu cuenta.
          </li>
          <li>
            <strong>Comunicación:</strong> permitir que otras personas te
            contacten si tenés información sobre un reporte.
          </li>
          <li>
            <strong>Seguridad:</strong> prevenir abuso, fraude y uso
            inadecuado de la plataforma.
          </li>
          <li>
            <strong>Cumplimiento legal:</strong> responder a solicitudes de
            autoridades competentes en el marco de la ley colombiana.
          </li>
        </ul>
      </Section>

      <Section title="4. Tus derechos (Habeas Data)">
        <p>
          Como titular de los datos personales, tenés los siguientes derechos,
          conforme a la Ley 1581 de 2012:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Conocer:</strong> saber qué datos tuyos tenemos y cómo los
            usamos.
          </li>
          <li>
            <strong>Actualizar y rectificar:</strong> corregir datos
            incorrectos o desactualizados (por ejemplo, en tu perfil).
          </li>
          <li>
            <strong>Suprimir:</strong> solicitar la eliminación de tus datos
            cuando ya no querás usar el servicio.
          </li>
          <li>
            <strong>Revocar:</strong> retirar tu consentimiento para el
            tratamiento de tus datos.
          </li>
          <li>
            <strong>Presentar quejas</strong> ante la Superintendencia de
            Industria y Comercio (SIC) por incumplimiento de la ley.
          </li>
          <li>
            <strong>Acceso gratuito:</strong> acceder a tus datos sin
            costo al menos una vez al mes.
          </li>
        </ul>
        <p className="mt-2">
          Para ejercer cualquiera de estos derechos, envianos una solicitud
          por los canales de contacto al final de este documento. Te
          responderemos en un plazo máximo de <strong>15 días hábiles</strong>{' '}
          según lo establece la ley.
        </p>
      </Section>

      <Section title="5. Conservación de los datos">
        <p>
          Conservamos tus datos personales mientras tu cuenta esté activa. Si
          la emergencia causada por el terremoto del 10 de agosto de 2026 se
          considera finalizada por las autoridades colombianas, te avisaremos
          con 30 días de anticipación antes de proceder a la eliminación de
          los datos inactivos.
        </p>
        <p>
          Los reportes publicados sobre personas desaparecidas pueden
          mantenerse visibles por más tiempo si la persona reportada aún no
          ha sido encontrada, para preservar el valor de la información.
        </p>
      </Section>

      <Section title="6. Medidas de seguridad">
        <p>
          Implementamos medidas técnicas y organizativas para proteger tus
          datos:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Cifrado en tránsito (HTTPS/TLS) en todas las comunicaciones.
          </li>
          <li>
            Autenticación mediante Supabase, con contraseñas hasheadas y
            tokens de sesión firmados.
          </li>
          <li>
            Políticas de seguridad a nivel de fila (RLS) en la base de datos:
            cada usuario solo puede modificar sus propios datos.
          </li>
          <li>
            Acceso restringido a los datos solo al personal autorizado del
            equipo operador.
          </li>
        </ul>
      </Section>

      <Section title="7. Cookies y tecnologías similares">
        <p>
          Usamos cookies estrictamente necesarias para mantener tu sesión
          iniciada y proteger la plataforma contra abuso. No usamos cookies de
          análisis, marketing ni seguimiento de terceros. Para más
          información, consultá nuestra{' '}
          <Link href="/legal/cookies" className="text-blue-600 underline">
            Política de Cookies
          </Link>
          .
        </p>
      </Section>

      <Section title="8. Cambios a esta política">
        <p>
          Podemos actualizar esta política para reflejar cambios en el
          servicio o en la ley. Te avisaremos por los medios de contacto
          registrados. La versión actualizada entrará en vigencia 15 días
          después de la notificación.
        </p>
      </Section>

      <Section title="9. Contacto">
        <p>
          Para cualquier consulta sobre el tratamiento de tus datos
          personales, incluyendo el ejercicio de tus derechos de Habeas Data,
          contactanos a través de los medios indicados en nuestra página
          principal.
        </p>
        <p>
          También podés presentar una queja ante la{' '}
          <strong>
            Superintendencia de Industria y Comercio (SIC)
          </strong>{' '}
          de Colombia.
        </p>
      </Section>

      <Section title="10. Marco legal">
        <p>
          Esta política se rige por la{' '}
          <strong>Ley 1581 de 2012</strong> y el{' '}
          <strong>Decreto 1377 de 2013</strong> de la República de Colombia.
        </p>
        <p className="text-xs text-gray-500 italic mt-4">
          <strong>Nota:</strong> este documento es una plantilla de política
          adaptada al contexto de emergencia de la plataforma. Antes de uso
          en producción se recomienda revisión por un abogado colombiano
          especializado en protección de datos.
        </p>
      </Section>

      <nav className="mt-8 pt-4 border-t flex flex-wrap gap-4 text-sm">
        <Link href="/legal/terminos" className="text-blue-600 underline">
          Términos y Condiciones
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
