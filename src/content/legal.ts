import { site } from "./site";

/**
 * Textos legales: aviso legal (LSSI), privacidad (RGPD), cookies y términos.
 *
 * Las condiciones de las tarifas, los horarios y la cama supletoria son los
 * mismos que hay en Redforts (inventario). Si cambian allí, hay que cambiarlos
 * aquí también.
 *
 * El titular (nombre o razón social y NIF) sale de `site.legal.owner` y
 * `site.legal.nif`. Mientras estén vacíos se nombra el establecimiento.
 */

export type LegalBlock = { type: "p"; text: string } | { type: "ul"; items: string[] };
export type LegalSection = { title?: string; body: LegalBlock[] };
export type LegalDoc = { title: string; updated: string; sections: LegalSection[] };

const UPDATED = "21 de octubre de 2026";
const { legal: l, contact } = site;
const name = l.company;
const holder = l.owner ? `${l.owner}${l.nif ? `, con NIF ${l.nif}` : ""}` : `el titular de ${name}`;
const address = `${l.street}, ${l.postalCode} ${l.city} (${l.region})`;
const phones = contact.phones.map((p) => p.label.replace(/^[TM]: /, "")).join(" y ");

const p = (text: string): LegalBlock => ({ type: "p", text });
const ul = (...items: string[]): LegalBlock => ({ type: "ul", items });

const identification: LegalBlock[] = [
  ul(
    `Titular: ${l.owner ?? name}`,
    ...(l.nif ? [`NIF: ${l.nif}`] : []),
    `Establecimiento: ${name}, pensión de una estrella`,
    `Domicilio: ${address}`,
    `Inscripción en el Registro de Empresas y Actividades Turísticas de Euskadi: ${l.license}`,
    `Email: ${contact.email}`,
    `Teléfonos: ${phones}`,
  ),
];

export const legal: Record<"notice" | "privacy" | "cookies" | "terms", LegalDoc> = {
  notice: {
    title: "Aviso legal",
    updated: UPDATED,
    sections: [
      {
        title: "Datos identificativos",
        body: [
          p(
            `En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI), se informa de que este sitio web, ${site.url.replace(/^https?:\/\//, "")}, pertenece a:`,
          ),
          ...identification,
        ],
      },
      {
        title: "Objeto",
        body: [
          p(
            `Este sitio web informa sobre el alojamiento ${name} y sus habitaciones, y permite consultar la disponibilidad y el precio y solicitar una reserva. El acceso es gratuito y supone aceptar este aviso legal.`,
          ),
        ],
      },
      {
        title: "Uso del sitio web",
        body: [
          p(
            "Quien navega por la web se compromete a usarla de forma lícita, a no dañar sus sistemas ni los de terceros y a facilitar datos ciertos cuando solicite una reserva.",
          ),
          p(
            "Procuramos que la información sea correcta y esté actualizada, pero puede contener errores puntuales. La disponibilidad y el precio que valen son los que se confirman para cada reserva.",
          ),
        ],
      },
      {
        title: "Propiedad intelectual",
        body: [
          p(
            `Los textos, fotografías, logotipos y diseño de esta web pertenecen a ${holder} o se usan con autorización. No se pueden copiar, distribuir ni modificar sin permiso, salvo para uso personal y privado.`,
          ),
        ],
      },
      {
        title: "Enlaces",
        body: [
          p(
            "La web enlaza con servicios de terceros (WhatsApp, Google Maps, Redforts o Stripe). No somos responsables de sus contenidos ni de sus condiciones, que se rigen por sus propias políticas.",
          ),
        ],
      },
      {
        title: "Legislación aplicable",
        body: [
          p(
            "Este aviso se rige por la legislación española. Si eres consumidor, para cualquier controversia son competentes los juzgados de tu domicilio. También puedes usar la plataforma europea de resolución de litigios en línea: https://ec.europa.eu/consumers/odr.",
          ),
        ],
      },
    ],
  },

  privacy: {
    title: "Política de privacidad",
    updated: UPDATED,
    sections: [
      {
        title: "Responsable del tratamiento",
        body: [
          p(
            "De acuerdo con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), el responsable de los datos personales que nos facilitas es:",
          ),
          ...identification,
        ],
      },
      {
        title: "Qué datos tratamos",
        body: [
          ul(
            "Al solicitar o hacer una reserva: nombre y apellidos, email, teléfono, país, fechas, habitación, número de personas y las observaciones que nos escribas.",
            "Al llegar al alojamiento: los datos del documento de identidad que exige la normativa de registro de viajeros.",
            "Si nos escribes por WhatsApp, email o teléfono: los datos que nos des en la conversación.",
          ),
          p("No pedimos datos de tarjeta en esta web. Si en algún momento se paga online, el pago lo gestiona Stripe en su propia página segura."),
        ],
      },
      {
        title: "Para qué los usamos y con qué base legal",
        body: [
          ul(
            "Gestionar tu solicitud de reserva, la reserva y la estancia, y comunicarnos contigo sobre ella. Base legal: la ejecución del contrato de alojamiento o de las medidas previas que nos pides (art. 6.1.b RGPD).",
            "Cumplir obligaciones legales: registro de viajeros ante la Ertzaintza, facturación y obligaciones fiscales (TicketBAI) y, cuando proceda, el impuesto turístico. Base legal: obligación legal (art. 6.1.c RGPD).",
            "Responder a tus consultas. Base legal: tu consentimiento al escribirnos y nuestro interés legítimo en atenderte (art. 6.1.a y 6.1.f RGPD).",
          ),
          p("No usamos tus datos para enviarte publicidad ni tomamos decisiones automatizadas sobre ti."),
        ],
      },
      {
        title: "Cuánto tiempo los guardamos",
        body: [
          p(
            "Mientras dure la relación y, después, durante los plazos legales: tres años los datos del registro de viajeros, y los plazos que marca la normativa fiscal y mercantil para la facturación (en general, de cuatro a seis años). Las consultas que no terminan en reserva se borran cuando ya no son necesarias.",
          ),
        ],
      },
      {
        title: "Con quién los compartimos",
        body: [
          p("No vendemos ni cedemos tus datos. Solo los comunicamos cuando la ley lo exige (Ertzaintza, Hacienda Foral de Gipuzkoa) y los tratan, por cuenta nuestra y con contrato, estos proveedores:"),
          ul(
            "Redforts: sistema de reservas y gestión del alojamiento.",
            "Vercel: alojamiento de la web.",
            "WhatsApp (Meta): si nos escribes o solicitas la reserva por WhatsApp.",
            "Stripe y Supabase: solo si pagas online (cobro y registro del pago).",
          ),
          p(
            "Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo. En ese caso lo hacen con las garantías del RGPD (decisión de adecuación, como el Marco de Privacidad de Datos UE-EE. UU., o cláusulas contractuales tipo).",
          ),
        ],
      },
      {
        title: "Tus derechos",
        body: [
          p(
            `Puedes pedir acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad de tus datos, y retirar tu consentimiento, escribiendo a ${contact.email} o por correo postal a ${address}. Indica qué derecho quieres ejercer.`,
          ),
          p("Si crees que no hemos tratado bien tus datos, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es)."),
        ],
      },
    ],
  },

  cookies: {
    title: "Política de cookies",
    updated: UPDATED,
    sections: [
      {
        title: "Qué usamos",
        body: [
          p("Esta web no usa cookies publicitarias ni de seguimiento, ni propias ni de terceros. Solo usa:"),
          ul(
            "Almacenamiento de sesión del navegador (ec-intro-visto): recuerda que ya has visto la animación de entrada para no repetirla en esa visita. Es técnico, se borra al cerrar la pestaña y no identifica a nadie.",
            "Estadísticas de Vercel Web Analytics: cuentan visitas de forma agregada y anónima, sin cookies y sin identificarte.",
          ),
        ],
      },
      {
        title: "Servicios de terceros",
        body: [
          p(
            "La página de Ubicación muestra un mapa de Google Maps. Al cargarlo, Google puede instalar sus propias cookies, según su política (policies.google.com/technologies/cookies). Si no quieres, puedes no visitar esa página o bloquear las cookies de terceros en tu navegador.",
          ),
          p("Si pagas online, Stripe usa en su página de pago las cookies necesarias para que el pago sea seguro y prevenir el fraude."),
        ],
      },
      {
        title: "Cómo gestionarlas",
        body: [
          p(
            "Puedes ver, bloquear o borrar las cookies y el almacenamiento de los sitios desde la configuración de tu navegador (Chrome, Safari, Firefox o Edge). La web funciona igual aunque los bloquees.",
          ),
        ],
      },
    ],
  },

  terms: {
    title: "Términos y condiciones",
    updated: UPDATED,
    sections: [
      {
        title: "Quién presta el servicio",
        body: [p(`El alojamiento lo presta ${holder}, en ${name}, ${address}, inscrito en el Registro de Empresas y Actividades Turísticas de Euskadi con el número ${l.license}.`)],
      },
      {
        title: "Cómo se reserva",
        body: [
          p(
            "En la web eliges fechas, número de personas, habitación y tarifa, y ves el precio total en ese momento. Al pulsar «Solicitar reserva por WhatsApp» nos envías la solicitud con esos datos.",
          ),
          p(
            "Una solicitud no es todavía una reserva: la reserva queda hecha cuando te la confirmamos por escrito (WhatsApp o email). Si mientras tanto la habitación deja de estar libre o cambia el precio, te lo decimos antes de confirmar.",
          ),
        ],
      },
      {
        title: "Precios",
        body: [
          p(
            "Los precios se muestran en euros, por la estancia completa, con el IVA incluido. Cuando entre en vigor el impuesto turístico de Donostia (1 de enero de 2027), se sumará aparte por persona y noche según la ordenanza municipal.",
          ),
        ],
      },
      {
        title: "Tarifas, pago y cancelación",
        body: [
          p("Cada reserva se hace con una de estas tarifas, que se muestran al elegirla:"),
          ul(
            "Tarifa Estándar: puedes cancelar gratis hasta 7 días antes de la llegada. Si cancelas en los 7 días anteriores a la llegada, o si no te presentas, el cargo es el precio total de la reserva.",
            "Tarifa No Reembolsable: no admite cancelaciones. Si cancelas, modificas la reserva o no te presentas, el cargo es el precio total. Puedes cambiar las fechas una vez, hasta 7 días antes de la llegada, a un precio igual o mayor; solo pagas la diferencia.",
          ),
          p("El pago es del precio total de la reserva, en las condiciones que te indiquemos al confirmarla."),
          p(
            "Al tratarse de un servicio de alojamiento en fechas concretas, no se aplica el derecho de desistimiento de 14 días (art. 103.l del texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios).",
          ),
        ],
      },
      {
        title: "Entrada y salida",
        body: [
          ul(
            "Entrada (check-in): de 16:00 a 22:00. Si vas a llegar fuera de ese horario, avísanos antes.",
            "Salida (check-out): antes de las 11:00.",
          ),
          p("A la llegada hay que presentar un documento de identidad válido de cada huésped, como exige la normativa de registro de viajeros."),
        ],
      },
      {
        title: "Normas de la casa",
        body: [
          ul(
            "Cada habitación admite como máximo el número de personas indicado en su ficha. Se puede pedir cama supletoria, según disponibilidad; consúltanos el precio.",
            "No se puede fumar dentro del alojamiento.",
            "Mascotas: consúltanos antes de reservar.",
            "Pedimos respeto al descanso de los demás huéspedes y de los vecinos, sobre todo por la noche.",
            "Los desperfectos causados en la habitación o en las zonas comunes se cobran a quien los cause.",
          ),
        ],
      },
      {
        title: "Reclamaciones",
        body: [
          p(
            `Para cualquier incidencia escríbenos a ${contact.email} o llámanos. El alojamiento tiene hojas de reclamaciones oficiales a tu disposición. Estas condiciones se rigen por la legislación española.`,
          ),
        ],
      },
    ],
  },
};
