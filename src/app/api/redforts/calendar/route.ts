import { getCalendar } from "@/lib/redforts/api";
import { redfortsErrorResponse } from "@/lib/redforts/http";
import { calendarQuerySchema } from "@/lib/redforts/schemas";

export const runtime = "nodejs";

/** GET /api/redforts/calendar?acco_id= → /calendar_data (para el selector de fechas) */
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = calendarQuerySchema.safeParse(params);
  if (!parsed.success) return Response.json({ errors: ["Parámetros no válidos."] }, { status: 400 });

  try {
    const cal = await getCalendar(parsed.data.acco_id ? { acco_id: parsed.data.acco_id } : {});
    return Response.json(
      {
        datesInfo: cal.dates_info,
        firstDate: cal.first_date,
        lastDate: cal.last_date,
        firstWeekendDay: cal.first_weekend_day,
        lastWeekendDay: cal.last_weekend_day,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return redfortsErrorResponse(error);
  }
}
