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

## Pantalla de «Próximamente»

En producción (enjoycomfort.com) **solo se ve una pantalla de «Estamos
trabajando en nuestra nueva web»** con el logo animado, en cualquier URL. En
local y en las vistas previas de Vercel se ve la web completa.

Para abrir la web: en Vercel > Settings > Environment Variables, añadir
`SITE_LAUNCHED=true` en Production y volver a desplegar. Los textos de la
pantalla están en `src/content/home.ts` (`comingSoon`).

## El embudo de reserva

1. **Home**: foto de San Sebastián a pantalla completa con las cuatro cards de
   habitación encima (tipo · capacidad · «desde XX €/noche» · botón Reservar).
2. Cada card lleva a `/reservar?habitacion=doble|dos-camas|doble-privado|familiar`.
3. El formulario llega **con la habitación ya marcada**; solo hay que poner
   fechas y se abre el motor de Redforts con todo preseleccionado.
4. En móvil las cards se deslizan en horizontal; en la lista de habitaciones
   cada una tiene su propio botón «Reservar» que salta el paso intermedio.

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

En `src/content/rooms.ts`, cada habitación tiene `priceFrom`. Ahora está en
`null`, así que la web muestra «desde XX €» y **los precios no se publican en
los datos estructurados**. En cuanto pongas el número real (`priceFrom: 45`)
aparece en las cards, en la lista y en el schema de buscadores.

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

**Para que esto funcione de verdad falta**: dominio real en `site.url`,
dirección y teléfono (van al schema), y darlo de alta en Google Business Profile.

## Reservas: Redforts

Redforts es el motor de reservas y el PMS: tiene la disponibilidad real, los
precios, el channel manager (Booking.com y demás portales), el cobro y el
correo de confirmación. La web no guarda ni cobra nada.

> **Reserva nativa con la Booking API v5 + Stripe** (`BOOKING_PROVIDER=redforts`):
> ver [`docs/redforts.md`](docs/redforts.md). Lo que sigue describe el flujo
> `legacy` (iframe), que es el que hay por defecto.

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

## Newsletter — requiere backend

`src/app/api/newsletter/route.ts` valida y responde **501**, y la web enseña ese
aviso en vez de una confirmación falsa. Para activarla, conectar a Brevo,
Mailchimp o Resend Audiences con la clave en una variable de entorno.

## Datos pendientes del cliente

Marcados con `PENDIENTE` en `src/content/site.ts`:

- Razón social, NIF, dirección exacta y código postal.
- Email y teléfono reales.
- Dominio definitivo.
- Perfiles de redes sociales.
- **Precios por tipo de habitación** (aquí para mostrarlos, y en Redforts para cobrarlos).
- Cuenta de Redforts: `beCode` y los `accoIds` (`src/content/booking.ts`).
- Horarios de check-in/check-out, condiciones de pago y cancelación, idiomas
  de atención (`src/content/pages.ts`, sección Info práctica).
- Textos legales de privacidad y términos.
- Revisar que los argumentos de «¿Por qué dormir en Enjoy Comfort?» y «Qué
  incluye» son ciertos (wifi, limpieza diaria, ropa de cama).

## Fotos

Las 19 imágenes de `public/media` son las que enviaste, redimensionadas y
optimizadas. Las de habitaciones vienen de `fotos_habitaciones` y las de la
ciudad de `fotos_ciudad`; confirmaste que hay licencia para usarlas.
Para sustituir cualquiera, deja el mismo nombre de archivo o cambia la ruta en
`src/content/media.ts`.

## Pendiente de decidir

- **Logo**: la marca (el trazo de la bahía) y el logotipo de texto son
  provisionales; falta el logo real del alojamiento.
- **Tipografía de titulares**: Newsreader (libre). La referencia original usaba
  una fuente de pago; si se compra, se cambia en `src/app/layout.tsx`.
- **Mapa**: iframe de Google Maps con la ciudad, porque aún no hay dirección
  pública. Con la dirección real se centra en el alojamiento.
