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

## En producción

La web está **abierta al público** en enjoycomfort.com y Google puede
indexarla (`robots.txt` la permite solo en producción; las vistas previas de
Vercel y el entorno local llevan `noindex`). Variables de Vercel (Production):

| Variable | Valor | Para qué |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://enjoycomfort.com` | Canonical, sitemap y datos estructurados |
| `BOOKING_PROVIDER` | `redforts` | Reserva nativa con disponibilidad y precio reales |
| `SITE_LAUNCHED` | sin definir | Con `false` vuelve la pantalla de «Próximamente» |
| `SITE_INDEXABLE` | sin definir | Con `false` se bloquea a Google |

Fuera de Vercel:

- **DNS de `www.enjoycomfort.com`**: ahora apunta a `dmspub1.buuteeq.com` (la
  web antigua, que ya no existe) y no carga. En el panel de DNS del dominio,
  cambiar el CNAME de `www` a `cname.vercel-dns.com` y añadir
  `www.enjoycomfort.com` en Vercel > Settings > Domains (redirigiendo a
  `enjoycomfort.com`).
- **Titular y NIF**: los textos legales ya están escritos
  (`src/content/legal.ts`), pero el aviso legal exige identificar al titular.
  Rellenar `owner` y `nif` en `site.legal` (`src/content/site.ts`).
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
3. El huésped rellena sus datos y el final depende de `CHECKOUT_MODE`
   (variable de Vercel; ver `checkoutMode()` en `src/content/booking.ts`):
   - **`tpv`** (por defecto en las vistas previas): «Reservar y pagar». El
     servidor vuelve a comprobar disponibilidad y precio, crea la reserva en
     Redforts **pendiente de pago** y lleva al huésped al pago con tarjeta del
     **TPV virtual (Redsys) configurado en Redforts**. Si no paga, Redforts la
     anula sola (~30 min). La web no ve ni guarda la tarjeta. Debajo queda
     «¿Prefieres reservar por WhatsApp?».
   - **`whatsapp`** (por defecto en producción): «Solicitar reserva por
     WhatsApp», con habitación, tarifa, fechas, personas, precio y datos ya
     escritos. No se cobra nada.
   - `pay`: pago con Stripe (programado pero sin usar: el TPV está en Redforts).

   Para pasar producción al TPV: `CHECKOUT_MODE=tpv` en Vercel (Production) y
   Redeploy. El servidor rechaza crear reservas o pagos en cualquier otro modo.

Hay además un botón flotante de WhatsApp en todas las páginas, siempre visible (por encima del menú, de la barra de reserva y del aviso de cookies), y los teléfonos
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
| Aviso legal, privacidad, cookies y términos (tarifas y normas, las de Redforts) | `src/content/legal.ts` |
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

Dominio, dirección y teléfono ya son los reales. Falta dar de alta el
alojamiento en Google Business Profile y en Search Console (enviar el sitemap).

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

- **Titular y NIF** (`site.legal.owner` y `site.legal.nif` en
  `src/content/site.ts`): aparecen solos en el aviso legal, la privacidad y los
  términos en cuanto se rellenan.
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
- La pantalla de «Próximamente» (`SITE_LAUNCHED=false`) es solo visual: con
  ella puesta, las páginas y la API siguen respondiendo si se conoce la URL.

## Fotos

Las fotos de `public/media` (ciudad y detalles) son las que enviaste,
redimensionadas y optimizadas; confirmaste que hay licencia para usarlas. Para
sustituir cualquiera, deja el mismo nombre de archivo o cambia la ruta en
`src/content/media.ts`.

### Fotos de las habitaciones

No están en el repositorio: están en **Vercel Blob** (store público
`enjoycomfort-media`, conectado al proyecto), en la carpeta `habitaciones/`.
Son los originales editados, a 1920 px de ancho como máximo, calidad 80 y sin
metadatos EXIF ni GPS.

- `src/content/room-photos.json` guarda la URL, el ancho y el alto de cada foto.
  Lo escribe el script de subida; no hace falta editarlo a mano.
- `src/content/media.ts` (`roomPhotos`) lo lee y añade el texto alternativo de
  cada habitación.
- `next.config.ts` permite a `next/image` cargar
  `https://0qeiuusypiirkq70.public.blob.vercel-storage.com/habitaciones/**`.
  Si se cambia de store, hay que cambiar ese host.

Para cambiarlas:

1. Prepara los JPG en una carpeta **fuera del repo**, con el nombre
   `<habitacion>-<n>.jpg` (`doble`, `dos-camas`, `doble-privado`, `familiar`).
   `n` es el orden en la galería y la `1` es la portada. Quítales los metadatos.
2. `vercel env pull .env.local`. El script necesita `BLOB_READ_WRITE_TOKEN`,
   que llega así desde Vercel. Ese token solo va en `.env.local`: nunca en el
   código, en un commit ni en una variable `NEXT_PUBLIC_`.
3. `npm run photos:upload -- <carpeta>`. Sube cada foto a
   `habitaciones/<nombre>.jpg` (sobrescribe la anterior, caché de un año) y
   reescribe `room-photos.json`.
4. Commit de `room-photos.json`. Ojo: si una foto sustituye a otra con el
   mismo nombre, la URL no cambia, y los navegadores y la caché de imágenes de
   Vercel pueden seguir enseñando la antigua (la caché es de un año). Para que
   el cambio se vea ya, invalida la caché de imágenes en el proyecto de Vercel.

## Pendiente de decidir

- **Logo**: la marca (el trazo de la bahía) y el logotipo de texto son
  provisionales; falta el logo real del alojamiento.
- **Tipografía de titulares**: Newsreader (libre). La referencia original usaba
  una fuente de pago; si se compra, se cambia en `src/app/layout.tsx`.
