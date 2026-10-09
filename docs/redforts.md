# Redforts: reserva nativa con la Booking API v5 + Stripe

Especificación oficial (manda sobre este documento):
<https://oscar.redforts.com/static-070c8e81/redforts-booking-api-20240402.pdf>

## Cómo funciona

Redforts es la **única fuente de verdad** de disponibilidad, precios y reservas.
Comparte inventario con Booking, Hostelworld, Airbnb, Expedia… (lo sincroniza
Redforts; la API no tiene webhooks). La web no guarda disponibilidad: consulta
en tiempo real y guarda solo el registro de pagos y reservas para la
idempotencia.

```
Navegador                    Servidor (Vercel, cdg1)                Redforts / Stripe / Supabase
─────────                    ───────────────────────                ────────────────────────────
calendario  ── GET ──▶ /api/redforts/calendar ───────────────▶ /calendar_data
buscar      ── GET ──▶ /api/redforts/availability ───────────▶ /availability
pagar       ── Server Action startCheckout
                        1. revalida con /availability ───────▶ /availability
                        2. calcula el importe en el servidor
                        3. guarda la reserva pendiente ──────▶ Supabase (redforts_bookings)
                        4. Checkout Session, captura manual ─▶ Stripe
            ◀─ redirige a Stripe ─
Stripe      ── webhook checkout.session.completed ──▶ /api/stripe/webhook
                        5. reclama la fila (pending → processing, UPDATE atómico)
                        6. /reservation (confirmed, ignore_prepayment, nota del pago) ▶ Redforts
                        7. confirmada → captura · rechazada → anula · red/timeout → revisión manual
vuelta      ── /reservar/confirmada?session_id=… lee Supabase y se refresca sola
```

- El código de conexión va dentro de la URL y es secreto. Solo se usa en el
  servidor (`import "server-only"`), nunca se loguea y nunca va a una variable
  `NEXT_PUBLIC_`. El inventario lleva **todos los códigos promocionales**: al
  navegador solo llega una versión filtrada (`toPublicInventory`).
- `/inventory` se cachea 1 h (`redforts-inventory`); si otra respuesta trae un
  `inventory_version` mayor, se invalida. Disponibilidad y reservas: `no-store`.
- Lecturas: timeout de 10 s y un reintento. `/reservation`: **nunca** se
  reintenta (no hay idempotencia en Redforts; se podría duplicar la reserva).
- Nunca se mandan datos de tarjeta a Redforts (`card_*`): los gestiona Stripe.
- No se usa `sales_channel_id` (con él Redforts no comprueba el precio).

### Archivos

| Qué | Dónde |
| --- | --- |
| Cliente, tipos, validación, precios | `src/lib/redforts/` (`client.ts`, `types.ts`, `schemas.ts`, `pricing.ts`, `inventory.ts`, `api.ts`) |
| Rutas de consulta | `src/app/api/redforts/{calendar,availability}/route.ts` |
| Pago (Server Action) | `src/app/reservar/actions.ts` |
| Webhook | `src/app/api/stripe/webhook/route.ts` |
| Registro en Supabase | `src/lib/bookings.ts` + `supabase/migrations/…_redforts_bookings.sql` |
| Interfaz | `src/components/booking/` y `src/app/reservar/page.tsx` |
| Confirmación / Mi reserva | `src/app/reservar/confirmada/`, `src/app/mi-reserva/` |
| Tests | `src/lib/redforts/*.test.ts` (`npm test`) |
| Prueba de conexión | `scripts/redforts-smoke.ts` (`npm run redforts:smoke`) |

## Variables de entorno

Ver `.env.example`. Hay que crearlas en `.env.local` (local) y en Vercel
(**Production y Preview**): `BOOKING_PROVIDER`, `REDFORTS_API_BASE`,
`REDFORTS_CONNECTION_CODE`, `REDFORTS_TEST_EMAIL`, `REDFORTS_TEST_MODE`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`.

- `BOOKING_PROVIDER=legacy` (por defecto) deja el iframe de Redforts como hasta
  ahora. `redforts` activa la reserva nativa.
- `REDFORTS_TEST_MODE=true` en local y Preview. **Según la especificación, con
  `api_test` la reserva NO se crea en el PMS**: no aparecerá en la agenda de
  Redforts; solo llega el correo a `REDFORTS_TEST_EMAIL`. Pasar a `false` en
  Production solo cuando se decida.
- `.env.local` está en `.gitignore` (`.env*`).

### Base de datos (Supabase)

Aplicar `supabase/migrations/20261009180000_redforts_bookings.sql` en el
proyecto (SQL Editor, o `supabase db push`). Crea `redforts_bookings` con RLS
activado y sin políticas: solo el servidor accede, con la clave secreta.

Estados: `pending` → `processing` → `confirmed` | `unconfirmed` | `rejected` |
`unknown` | `capture_failed`; `expired` si no se llegó a pagar.

**Revisión manual** (consultar a diario mientras se prueba):

```sql
select id, created_at, status, reserv_id, payment_intent_id, amount_cents, errors
from redforts_bookings
where status in ('unknown', 'capture_failed', 'unconfirmed')
   or (status = 'processing' and updated_at < now() - interval '5 minutes')
order by created_at desc;
```

- `unknown`: falló la red al crear la reserva. Mirar en Redforts si existe
  (por la nota «Pagado Stripe pi_…»): si existe, capturar el pago en Stripe;
  si no, cancelarlo. La autorización caduca a los 7 días.
- `capture_failed`: la reserva existe pero no se cobró: capturar en Stripe.
- `unconfirmed`: el hotel tiene que aceptarla; después, capturar en Stripe.

## Prueba de mañana, paso a paso (local)

1. **Variables** en `.env.local`: el código de conexión, `REDFORTS_TEST_MODE=true`,
   `REDFORTS_TEST_EMAIL=tu@email`, `BOOKING_PROVIDER=redforts`, las claves de
   **prueba** de Stripe y las de Supabase.
2. **Base de datos**: aplicar la migración (ver arriba).
3. **Conexión con Redforts** (no crea nada):
   ```bash
   npm run redforts:smoke
   ```
   Debe listar alojamientos, tarifas, campos y precios a 30 días.
   Apunta los `acco_id`: los necesitarás para comparar con el panel.
4. **Tests**: `npm test`.
5. **Webhook de Stripe** en otra terminal (requiere la CLI de Stripe):
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copia el `whsec_…` que imprime a `STRIPE_WEBHOOK_SECRET` y reinicia `npm run dev`.
6. `npm run dev` y abre <http://localhost:3000/reservar>.
7. Elige fechas en el calendario (los días sin disponibilidad salen tachados),
   personas y busca. Elige una opción, rellena los datos y paga con
   `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC.
8. Comprueba:
   - En la terminal de `stripe listen`: `checkout.session.completed` → 200.
   - En la de `npm run dev`: `⚠️ RESERVA DE PRUEBA (api_test)` y
     `reserva confirmada y cobrada`.
   - La página de vuelta muestra «¡Reserva confirmada!» con el número.
   - En Stripe (modo prueba): el pago aparece **capturado**.
   - En Supabase: la fila en `confirmed` con `reserv_id`.
   - El correo de prueba llega a `REDFORTS_TEST_EMAIL`.
   - En Redforts **no** aparece (es `api_test`).
9. `/mi-reserva`: con una reserva de prueba seguramente dé 304 («no
   encontrada»), porque no existe en el PMS. Esta página solo se puede probar
   de verdad con una reserva real.

### Casos a probar

| Caso | Cómo | Resultado esperado |
| --- | --- | --- |
| Sin disponibilidad | Fechas con días tachados o temporada completa | «No hay habitaciones libres…»; el calendario no deja empezar en días sin llegada |
| Estancia mínima | Una noche en fechas con mínimo de varias | Opciones con «Fechas propuestas: …» |
| Promo válida | Un código del panel | Precio tachado (`orig_price`) y total con descuento |
| Promo inválida | `NOEXISTE` | Error traducido: «El código promocional no existe.» (210) |
| Dos habitaciones en la misma reserva | 4 adultos sin habitación de 4 | «Combina varias»; se eligen 2 y la reserva lleva 2 `accos` |
| Pago rechazado | Tarjeta `4000 0000 0000 0002` | Stripe muestra el rechazo; no hay webhook ni reserva; la fila queda `pending` y pasa a `expired` a los 30 min |
| Webhook duplicado | `stripe events resend evt_…` con el evento de una reserva ya hecha | Log «evento duplicado… se ignora»; no hay segunda reserva |
| Precio cambiado entre búsqueda y pago | Buscar, cambiar el precio en el panel y pagar | «El precio ha cambiado desde tu búsqueda: ahora son X €» y nueva búsqueda automática |
| Precio cambiado ya en Stripe | Cambiar el precio con la pantalla de Stripe abierta y pagar | Redforts responde 301; se anula la autorización; la página dice «No se te ha cobrado nada» |
| Motor desactivado | Desactivar el motor en el panel | 406 → «La reserva online está desactivada…» |

## Dudas para Redforts

Marcadas en el código con `// REDFORTS-DUDA:`.

1. **`api_test`**: la especificación dice que con `api_test` la reserva «no se
   crea realmente en el PMS». ¿Confirmado? ¿Hay forma de probar de principio a
   fin con una reserva que sí se cree (sandbox, cuenta de pruebas)?
2. **Pagos externos**: ¿se puede registrar por API un pago hecho fuera de
   Redforts? Ahora va en `notes` («Pagado Stripe pi_… 120.00 €») con
   `ignore_prepayment: true`.
3. **Cancelación**: no hay endpoint para cancelar una reserva por API.
4. **Límites**: ¿hay límite de peticiones? ¿Sandbox? ¿CORS? (todo va desde el servidor).
5. **`unconfirmed`**: si el hotel no acepta reservas automáticamente, la API
   responde `unconfirmed`. Ahora el pago queda retenido sin cobrar. ¿Es lo correcto?
6. **Ocupación de las opciones**: ¿`adults`/`children` de una opción de
   /availability es la ocupación a la que corresponde el precio o la capacidad
   máxima? ¿Puede venir la misma tarifa con precios distintos según ocupación?
7. **Promo de importe fijo**: ¿el `price` de cada acco en /reservation va con o
   sin el `promo_amount` descontado?
8. **`excl_taxes`**: si no es null, ¿hay que cobrar esos impuestos aparte? Ahora se suman al cobro.
9. **/reservation_data**: dice «email o *surname*» pero el parámetro es `name`.
10. **Textos de `items`** en Inventory Texts remiten a «Inventory Rate Texts» (¿errata?).
11. **Países**: la especificación dice mayúsculas; el ejemplo trae minúsculas
    (se convierten a mayúsculas).
12. **Moneda**: objeto en /inventory, código ISO en /availability.
13. El ejemplo de /reservation usa un campo `company` que no está documentado.

## Pendiente

- Rate limiting de `/api/redforts/*` y de la Server Action (hoy cualquiera
  puede lanzar búsquedas sin límite contra Redforts).
- Borrado periódico de los datos personales de `redforts_bookings`.
- Extras antes de reservar (`/item_list` con fechas): la función existe
  (`getItemList`) pero la interfaz solo los ofrece en «Mi reserva».
- Los extras de «Mi reserva» se pagan en el alojamiento (no pasan por Stripe).
