# Enjoy Comfort San Sebastián — web

Next.js 16 (App Router) + Tailwind CSS 4, lista para desplegar en Vercel.
Hostal económico en San Sebastián: el objetivo de la web es que reservar cueste
lo mínimo posible en clics, y posicionar para «hostal barato en San Sebastián».

## Arrancar en local

```bash
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # build de producción
npm run lint
```

## El embudo de reserva

1. **Home**: foto de San Sebastián a pantalla completa con las tres cards de
   habitación encima (tipo · capacidad · «desde XX €/noche» · botón Reservar).
2. Cada card lleva a `/reservar?habitacion=individual|doble|triple`.
3. El formulario llega **con la habitación ya marcada** y el nº de personas
   ajustado al máximo de esa habitación; solo hay que poner fechas y datos.
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

- `<h1>` de la home: «Hostal barato en San Sebastián», con el titular grande
  como texto de apoyo. La palabra clave aparece de forma natural en los textos,
  sin bloques de relleno ni texto oculto (Google penaliza ambas cosas).
- Metadatos, canonical, Open Graph y keywords en `site.seo`; cada página tiene
  su propio título y descripción.
- Datos estructurados (`src/components/Schema.tsx`): ficha `Hostel` con
  dirección y servicios, y `FAQPage` con las preguntas de la home, que puede
  salir desplegada en los resultados de búsqueda.
- `sitemap.xml` y `robots.txt` se generan solos.
- Los textos alternativos de las fotos describen la imagen e incluyen la
  ubicación donde tiene sentido.

**Para que esto funcione de verdad falta**: dominio real en `site.url`,
dirección y teléfono (van al schema), y darlo de alta en Google Business Profile.

## Reservas: Stripe (cobro) + Beds24 (inventario y canales)

El huésped reserva y paga **dentro de la web**. El reparto de papeles:

- **La web**: elige habitación, fechas y personas, recoge los datos del titular
  y lanza el pago. No toca ni un dato de tarjeta (lo hace la pantalla de Stripe).
- **Stripe**: cobra la señal.
- **Beds24**: tiene la disponibilidad real, sincroniza Booking.com y los demás
  portales, guarda la reserva y manda la confirmación.
- **Chekin**: al ver la reserva en Beds24, envía al huésped el registro de
  viajeros para la policía.

### El flujo, y por qué está en este orden

1. `POST /api/checkout` valida los datos y crea una sesión de Stripe Checkout.
   El importe se **retiene**, no se cobra (`captureMethod: "manual"`).
2. El huésped paga en la pantalla de Stripe y vuelve a `/reservar/confirmada`.
3. `POST /api/stripe/webhook` recibe el aviso de Stripe y entonces:
   comprueba en Beds24 que la habitación **sigue** libre, crea la reserva y solo
   entonces cobra de verdad. Si ya no está, anula la retención y el huésped no
   paga nada.

Ese orden existe por un motivo: entre que alguien rellena el formulario y paga
pueden pasar minutos, y en ese hueco Booking.com puede vender la última cama.
Cobrar primero y comprobar después significa devolver dinero (y Stripe no
devuelve su comisión).

**Contrapartida de la retención**: Stripe no admite Bizum con pago retenido, así
que en modo `"manual"` solo hay tarjeta. Si se prefiere ofrecer Bizum, cambiar
`captureMethod` a `"automatic"` en `src/content/booking.ts` y asumir la
devolución en el caso raro de que la habitación se haya vendido.

### Estado

| Pieza | Estado |
| --- | --- |
| Formulario a pantalla partida | ✅ hecho |
| Creación de la sesión de pago (`/api/checkout`) | ✅ hecho |
| Página de vuelta (`/reservar/confirmada`) | ✅ hecho |
| Webhook con verificación de firma | ✅ hecho |
| Consultar disponibilidad en Beds24 | ⏳ falta la cuenta |
| Crear la reserva en Beds24 y capturar el cobro | ⏳ falta la cuenta |

Los dos pendientes están marcados con `TODO(beds24)` en
`src/app/api/stripe/webhook/route.ts`. No se pueden escribir a ciegas: hay que
poder llamar a la API de verdad para probarlos.

**Mientras falte cualquiera de las dos piezas, no se cobra a nadie.**
`/api/checkout` responde 503 y la web enseña el teléfono y el email en lugar del
botón de pagar. No hay forma de que un huésped pague sin que su reserva se cree.

### Poner Stripe en marcha

1. Crear cuenta en Stripe y copiar `.env.example` a `.env.local` con la clave
   **de prueba** (`sk_test_...`).
2. Webhook en local:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copiar el `whsec_...` que imprime a `STRIPE_WEBHOOK_SECRET`.
3. En producción, crear el endpoint en Stripe apuntando a
   `https://TU-DOMINIO/api/stripe/webhook` con los eventos
   `checkout.session.completed` y `checkout.session.expired`.
4. Tarjeta de prueba: `4242 4242 4242 4242`, cualquier fecha futura y CVC.

Comisión de Stripe en España: 1,5% + 0,25 € por cobro con tarjeta europea.

### La señal

Se configura en `src/content/booking.ts`: por defecto el precio de la primera
noche (`depositType: "first-night"`). También admite un porcentaje o el importe
completo. **Sin precios en `src/content/rooms.ts` no se puede cobrar**, así que
las tarifas reales son un requisito previo.

### Beds24: para activarlo

En `src/content/booking.ts`: `propId` (SETTINGS > PROPERTIES) y los `roomIds`
(SETTINGS > PROPERTIES > ROOMS). El token de la API se genera en
SETTINGS > MARKETPLACE > API y va en `.env.local`.

Verificado en su documentación: la conexión con Booking.com se pide desde el
extranet de Booking (Cuenta > Proveedor de conectividad), es bidireccional
marcando «Reservas» y «Tarifas y disponibilidad», el anuncio y las valoraciones
se mantienen, y hay un botón para importar las reservas ya existentes.

### Antes de contratar, dos cosas por escrito

1. **Chekin**: que confirme el envío automático al *Registro Hostelero de la
   Ertzaintza* **para un hostal**. Aquí el parte de viajeros NO va a
   SES.HOSPEDAJES: Euskadi tiene su propio sistema, y la documentación de Chekin
   en Beds24 habla de «las autoridades» sin nombrar Euskadi.
2. **TicketBAI**: obligatorio en Gipuzkoa desde enero de 2024. Beds24 no lo
   cubre. Confirmar que las facturas las emite la gestoría con software
   homologado.

El **impuesto turístico de Donostia** entra en vigor el 1 de enero de 2027 (por
persona y noche, tope de 6 noches). Preguntar a Beds24 si lo soporta.

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
- **Precios por tipo de habitación** (aquí para mostrarlos, y en Beds24 para cobrarlos).
- Cuenta de Beds24 y de Chekin: `propId` y los `roomIds`.
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
  provisionales; falta el logo real del hostal.
- **Tipografía de titulares**: Newsreader (libre). La referencia original usaba
  una fuente de pago; si se compra, se cambia en `src/app/layout.tsx`.
- **Mapa**: iframe de Google Maps con la ciudad, porque aún no hay dirección
  pública. Con la dirección real se centra en el hostal.
