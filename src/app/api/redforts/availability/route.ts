import { getAvailability } from "@/lib/redforts/api";
import { redfortsErrorResponse } from "@/lib/redforts/http";
import { offerOptions } from "@/lib/redforts/pricing";
import { searchSchema } from "@/lib/redforts/schemas";

export const runtime = "nodejs";

/**
 * GET /api/redforts/availability?arrival&departure&adults&children&promo
 * → /availability, filtrado por capacidad (ver offerOptions).
 */
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = searchSchema.safeParse(params);
  if (!parsed.success) {
    return Response.json({ errors: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }
  const { arrival, departure, adults, children, promo } = parsed.data;

  try {
    const res = await getAvailability({ arrival, departure, ...(promo ? { promo } : {}) });
    const { options, combine } = offerOptions(res.options ?? [], adults, children);
    return Response.json(
      { currency: res.currency ?? "EUR", promoTotal: res.promo_total ?? null, combine, options },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return redfortsErrorResponse(error);
  }
}
