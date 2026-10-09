import { z } from "zod";

/**
 * Validación de todo lo que llega del navegador antes de hablar con Redforts.
 * Nunca se aceptan precios, periods ni acco_id del cliente sin revalidarlos
 * contra /availability en el servidor (ver pricing.ts y la Server Action).
 */

export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha con formato AAAA-MM-DD")
  .refine((s) => {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, "Fecha inexistente");

/** Letras, dígitos, puntos y guiones (Inventory Promo). Vacío = sin promo. */
export const promoCode = z
  .string()
  .trim()
  .max(40)
  .regex(/^[A-Za-z0-9.-]*$/, "Código promocional no válido")
  .transform((s) => (s === "" ? undefined : s))
  .optional();

const guestsCount = (min: number) => z.coerce.number().int().min(min).max(20);

export const searchSchema = z
  .object({
    arrival: isoDate,
    departure: isoDate,
    adults: guestsCount(1),
    children: guestsCount(0).default(0),
    promo: promoCode,
  })
  .refine((v) => v.departure > v.arrival, { message: "La salida debe ser posterior a la llegada", path: ["departure"] });

export type SearchInput = z.infer<typeof searchSchema>;

export const calendarQuerySchema = z.object({
  acco_id: z.coerce.number().int().positive().optional(),
});

/** Datos del huésped: se validan además contra `fields` del inventario. */
const guestValue = z.string().trim().max(200);

export const checkoutSchema = z.object({
  search: searchSchema,
  /** Opciones elegidas, identificadas por su clave (ver optionKey) */
  selection: z
    .array(z.object({ key: z.string().min(1).max(300), quantity: z.number().int().min(1).max(10) }))
    .min(1)
    .max(10),
  guest: z.record(z.string(), guestValue),
  notes: z.string().trim().max(1000).optional(),
  consent: z.boolean().default(false),
  /** Total que vio el huésped, para avisarle si ha cambiado */
  expectedTotal: z.number().nonnegative(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const lookupSchema = z.object({
  reserv_id: z.coerce.number().int().positive(),
  arrival: isoDate,
  email: z.string().trim().email().max(200),
});

export const itemsUpdateSchema = lookupSchema.extend({
  items: z.array(z.object({ id: z.number().int().nonnegative(), quantity: z.number().int().min(0).max(50) })).min(1),
});

/** Formatos de los campos del huésped (los obligatorios los marca el inventario) */
export const guestFieldFormats: Record<string, z.ZodType<string>> = {
  email: z.string().email("Email no válido"),
  country: z.string().regex(/^[A-Z]{2}$/, "País no válido"),
  arrival_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora HH:MM"),
  departure_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora HH:MM"),
  phone: z.string().regex(/^[+\d][\d\s().-]{5,}$/, "Teléfono no válido"),
  phone2: z.string().regex(/^[+\d][\d\s().-]{5,}$/, "Teléfono no válido"),
};
