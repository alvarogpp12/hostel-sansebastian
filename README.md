# Enjoy Comfort San Sebastián — web

Next.js 16 (App Router) + Tailwind CSS 4, lista para desplegar en Vercel.
Pensión de una estrella en el centro de San Sebastián (Enjoy Comfort): el
objetivo de la web es que reservar cueste lo mínimo posible en clics, y
posicionar para «alojamiento céntrico en San Sebastián».

## Arrancar en local

```bash
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # build de producción
npm run lint
```

## Publicar en producción (checklist)

En producción (enjoycomfort.com) ahora **solo se ve la pantalla de «Estamos
trabajando en nuestra nueva web»**, en cualquier URL. En local y en las vistas
previas de Vercel se ve la web completa. Para abrirla, en Vercel > Settings >
Environment Variables (entorno **Production**):

| Variable | Valor para lanzar | Para qué |
| --- | --- | --- |
| `SITE_LAUNCHED` | `true` | Quita la pantalla de «Próximamente» |
| `SITE_INDEXABLE` | `true` | Deja que Google indexe (si no, `robots.txt` lo bloquea todo) |
| `NEXT_PUBLIC_SITE_URL` | `https://enjoycomfort.com` | Canonical, sitemap y datos estructurados |
| `BOOKING_PROVIDER` | `redforts` | Reserva nativa con disponibilidad y precio reales (ya está así) |

Después, **Redeploy** del último despliegue de producción.

Fuera de Vercel:

- **DNS de `www.enjoycomfort.com`**: ahora apunta a `dmspub1.buuteeq.com` (la
  web antigua, que ya no existe) y no carga. En el panel de DNS del dominio,
  cambiar el CNAME de `www` a `cname.vercel-dns.com` y añadir
  `www.enjoycomfort.com` en Vercel > Settings > Domains (redirigiendo a
  `enjoycomfort.com`).
- **Textos legales** (aviso legal, privacidad, cookies, términos): siguen con
  texto de relleno en `src/content/pages.ts` y son obligatorios (LSSI y RGPD).
  Hacen falta la razón social y el NIF del titular.
- Alta en Google Business Profile y en Search Console (enviar el sitemap).

Los textos de la pantalla de «Próximamente» están en `src/content/home.ts`
(`comingSoon`).

## El embudo de reserva

Con `BOOKING_PROVIDER=redforts` (el de producción):

1. **Home**: buscador de fechas y personas, y el listado completo de
   habitaciones con su galería.
2. **/reservar**: la web pide a Redforts en tiempo real la disponibilidad y el
   precio de cada habitación y tarifa (flexible / no reembolsable). Si se llega
   desde una habitación (`/reservar?habitacion=doble|dos-camas|doble-privado|familiar`),
   sale la primera.
3. El huésped rellena sus datos y pulsa **«Solicitar reserva por WhatsApp»**: se
   abre el chat del 699 90 14 51 con habitación, tarifa, fechas, personas,
   precio y datos ya escritos. **No se cobra nada**; la reserva se confirma a
   mano por WhatsApp y se mete en Redforts.
4. Cuando se quiera cobrar online: `checkoutMode: "pay"` en
   `src/content/booking.ts` (pago con Stripe y reserva automática en Redforts,
   ver [`docs/redforts.md`](docs/redforts.md)). Mientras esté en `"whatsapp"`, el
   servidor rechaza cualquier intento de crear un pago.

Hay además un botón flotante de WhatsApp en todas las páginas, y los teléfonos
(fijo 943 43 12 28, móvil 699 90 14 51) en la cabecera, el menú y el pie.

## Páginas

Inicio · Habitaciones · Ubicación y qué ver · Info práctica · Reservar
(+ Privacidad y Términos). Se eliminaron las páginas de coworking, eventos e
historia del planteamiento anterior por no encajar con este público.

## Dónde se edita cada cosa

| Qué | Archivo |
| --- | --- |
| Marca, SEO, datos legales, contacto, menú, footer, CTA | `src/content/site.ts` |
| Habitaciones: nombre, capacidad, **precios**, textos, fotos y galería | `src/content/rooms.ts` |
| Textos de la home (incluida la sección de preguntas frecuentes) | `src/content/home.ts` |
| Textos del resto de páginas | `src/content/pages.ts` |
| Rutas de todas las imágenes | `src/content/media.ts` |
| Colores, tipografías, espaciados | `src/app/globals.css` |

### Precios

Los precios reales los da Redforts en `/reservar` para las fechas elegidas.
Además, en `src/content/rooms.ts` cada habitación tiene `priceFrom` (precio
orientativo «desde»). Está en `null`, así que no se muestra ni se publica en
los datos estructurados; con un número (`priceFrom: 45`) aparece en el listado
y en el schema de buscadores.

## SEO

- `<h1>` de la home: «Tu alojamiento céntrico en San Sebastián», con el titular grande
  como texto de apoyo. La palabra clave aparece de forma natural en los textos,
  sin bloques de relleno ni texto oculto (Google penaliza ambas cosas).
- Metadatos, canonical, Open Graph y keywords en `site.seo`; cada página tiene
  su propio título y descripción.
- Datos estructurados (`src/components/Schema.tsx`): ficha `LodgingBusiness` (una estrella) con
  dirección y servicios, y `FAQPage` con las preguntas de la home, que puede
  salir desplegada en los resultados de búsqueda.
- `sitemap.xml` y `robots.txt` se generan solos.
- Los textos alternativos de las fotos describen la imagen e incluyen la
  ubicación donde tiene sentido.

Dominio, dirección y teléfono ya son los reales. Falta poner `SITE_INDEXABLE=true`
al lanzar y dar de alta el alojamiento en Google Business Profile y Search Console.

## Reservas: Redforts

Redforts es el motor de reservas y el PMS: tiene la disponibilidad real, los
precios, el channel manager (Booking.com y demás portales), el cobro y el
correo de confirmación. La web no guarda ni cobra nada.

> **Reserva nativa con la Booking API v5 + Stripe** (`BOOKING_PROVIDER=redforts`):
> ver [`docs/redforts.md`](docs/redforts.md). Es el que está en producción. Lo
> que sigue describe el flujo `legacy` (iframe), que solo se usa si
> `BOOKING_PROVIDER` no es `redforts`.

### Cómo funciona

1. En `/reservar` el huésped elige habitación y fechas (la habitación llega
   marcada si viene de una card).
2. Al pulsar «Ver disponibilidad y precio», debajo se abre el motor de Redforts
   incrustado con esas fechas y esa habitación preseleccionadas. Ahí elige
   tarifa, número de personas, deja sus datos y paga.
3. El iframe se ajusta solo a la altura del motor (Redforts avisa con mensajes
   `ohbe_<altura>`), y hay un enlace para abrirlo en una pestaña nueva por si
   algún navegador lo bloquea.

La URL es la misma que monta el plugin oficial de Redforts para WordPress:
`https://booking.redforts.com/es/iframe/{beCode}/?arrival=AAAA-MM-DD&departure=AAAA-MM-DD&acco={id}`.

### Para activarlo

En `src/content/booking.ts`:

- `beCode`: el código del motor. En Redforts, Configuración > Motor de reservas
  > Integración: es lo que va después de `/iframe/` en el enlace del motor.
- `accoIds`: el id de cada tipo de habitación en Redforts. Si alguno se deja en
  `null`, el motor abre mostrando todas las habitaciones.

Mientras `beCode` sea `null`, la web no enlaza al motor: enseña el teléfono y el
email del alojamiento y explica que la reserva online aún no está activa.

### A confirmar con Redforts

1. **Registro de viajeros**: que envíe los partes al *Registro Hostelero de la
   Ertzaintza* (Euskadi no usa SES.HOSPEDAJES).
2. **TicketBAI**: obligatorio en Gipuzkoa desde enero de 2024.
3. **Impuesto turístico de Donostia**: entra en vigor el 1 de enero de 2027 (por
   persona y noche, tope de 6 noches).
4. Que el idioma `es` del motor esté activado (si se quiere otro, se cambia
   `lang` en `booking.ts`).

## Newsletter — apagada

El formulario del pie está oculto (`site.newsletter.enabled = false` en
`src/content/site.ts`) porque `src/app/api/newsletter/route.ts` aún no guarda
nada (responde **501**). Para activarla: conectar Brevo, Mailchimp o Resend
Audiences con la clave en una variable de entorno, añadir límite de envíos y
poner `enabled: true`.

## Datos

Ya reales: dirección (C/ Nueva 5 - 1ºB, 20001), nº de licencia HSS00744,
teléfonos, email `reservas@enjoycomfort.com`, dominio `enjoycomfort.com`,
horarios de entrada (16:00–22:00) y salida (antes de las 11:00) y condiciones
de las tarifas (los mismos que en Redforts), precios (salen de Redforts).

Pendientes:

- **Textos legales** (`src/content/pages.ts`): aviso legal, privacidad, cookies
  y términos. Necesitan la **razón social y el NIF** (`site.legal.company` en
  `src/content/site.ts`).
- **Redes sociales**: `site.social` está vacío y no se pinta ningún icono.
  Al añadir un perfil real, aparece en el menú y en el pie.
- **Foto de la habitación familiar** (`src/content/media.ts`): de momento es la
  de la antigua triple.
- Revisar que los argumentos de «¿Por qué dormir en Enjoy Comfort?» y «Qué
  incluye» son ciertos.

## Seguridad

- Ningún secreto en el repositorio: las claves (Redforts, Stripe, Supabase) van
  solo en variables de entorno de Vercel y se usan solo en el servidor
  (`import "server-only"`). Al navegador llega un inventario filtrado, sin
  códigos promocionales.
- Cabeceras de seguridad en `next.config.ts`: no se puede meter la web en un
  iframe ajeno, `nosniff`, `Referrer-Policy`, HSTS y `Permissions-Policy`.
- Webhook de Stripe con firma verificada; el precio siempre se calcula en el
  servidor con Redforts.
- Base de datos (Supabase) con RLS activado y sin políticas: solo el servidor
  puede leer o escribir.
- Pendiente recomendado: límite de peticiones (Vercel > Firewall > Rate
  limiting) para `/api/redforts/*`, `/reservar` y `/mi-reserva`, que consultan
  Redforts en cada petición.
- La pantalla de «Próximamente» es solo visual: con ella puesta, las páginas y
  la API siguen respondiendo si se conoce la URL. Con `SITE_LAUNCHED=true`
  deja de importar.

## Fotos

Las fotos de `public/media` son las que enviaste, redimensionadas y
optimizadas; confirmaste que hay licencia para usarlas. Las 27 de las
habitaciones (`public/media/habitaciones`) son las que había en Redforts, sin
metadatos ni GPS.
Para sustituir cualquiera, deja el mismo nombre de archivo o cambia la ruta en
`src/content/media.ts`.

## Pendiente de decidir

- **Logo**: la marca (el trazo de la bahía) y el logotipo de texto son
  provisionales; falta el logo real del alojamiento.
- **Tipografía de titulares**: Newsreader (libre). La referencia original usaba
  una fuente de pago; si se compra, se cambia en `src/app/layout.tsx`.
