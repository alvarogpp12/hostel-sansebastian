import Stripe from "stripe";

/**
 * Cliente de Stripe (solo servidor).
 *
 * La clave vive en la variable de entorno STRIPE_SECRET_KEY y nunca se
 * expone al navegador. Ver `.env.example`.
 */
let client: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Falta STRIPE_SECRET_KEY: copia .env.example a .env.local y rellénala.");
  client ??= new Stripe(key);
  return client;
}

/** ¿Está Stripe configurado? Se usa para no enseñar el botón de pago sin claves. */
export const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
