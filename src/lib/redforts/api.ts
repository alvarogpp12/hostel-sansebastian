import "server-only";
import { redforts } from "./client";
import { checkInventoryVersion } from "./inventory";
import type {
  AvailabilityRequest,
  AvailabilityResponse,
  CalendarDataRequest,
  CalendarDataResponse,
  ItemListRequest,
  ItemListResponse,
  ItemsUpdateRequest,
  ItemsUpdateResponse,
  ReservationDataRequest,
  ReservationDataResponse,
  ReservationRequest,
  ReservationResponse,
  SalesChannelsResponse,
} from "./types";

/**
 * Funciones de la Booking API v5. Todas son de servidor y lanzan
 * `RedfortsError` ante cualquier fallo (ver client.ts).
 *
 * La disponibilidad, los precios y las reservas nunca se cachean: Redforts
 * es la única fuente de verdad y comparte inventario con las OTAs.
 */

export { getInventory } from "./inventory";

export async function getCalendar(req: CalendarDataRequest = {}): Promise<CalendarDataResponse> {
  const res = await redforts<CalendarDataResponse>("calendar_data", req, { retry: true });
  await checkInventoryVersion(res.inventory_version);
  return res;
}

export async function getAvailability(req: AvailabilityRequest): Promise<AvailabilityResponse> {
  const res = await redforts<AvailabilityResponse>("availability", req, { retry: true });
  await checkInventoryVersion(res.inventory_version);
  return res;
}

export async function getItemList(req: ItemListRequest): Promise<ItemListResponse> {
  const res = await redforts<ItemListResponse>("item_list", req, { retry: true });
  await checkInventoryVersion(res.inventory_version);
  return res;
}

export async function getReservation(req: ReservationDataRequest): Promise<ReservationDataResponse> {
  const res = await redforts<ReservationDataResponse>("reservation_data", req, { retry: true });
  await checkInventoryVersion(res.inventory_version);
  return res;
}

/** Escritura: sin reintento. */
export function updateItems(req: ItemsUpdateRequest): Promise<ItemsUpdateResponse> {
  return redforts<ItemsUpdateResponse>("items_update", req);
}

export function getSalesChannels(): Promise<SalesChannelsResponse> {
  return redforts<SalesChannelsResponse>("sales_channels", {}, { retry: true });
}

/** ¿Se están mandando las reservas como prueba? (REDFORTS_TEST_MODE=true) */
export function isTestMode(): boolean {
  return process.env.REDFORTS_TEST_MODE === "true";
}

/**
 * Crea una reserva en Redforts. NUNCA se reintenta: si falla por timeout o
 * red, no sabemos si la reserva se ha creado, y quien llama debe dejarlo para
 * revisión manual en vez de repetir.
 *
 * Con REDFORTS_TEST_MODE=true añade `api_test`. Según la especificación,
 * con `api_test` la reserva NO se crea de verdad en el PMS; si el valor es un
 * email, la notificación se manda a esa dirección (y si no, no se manda nada).
 */
export async function createReservation(req: Omit<ReservationRequest, "api_test">): Promise<ReservationResponse> {
  if (req.sales_channel_id !== undefined) {
    // Con sales_channel_id Redforts no comprueba el precio: no se usa salvo indicación expresa.
    throw new Error("sales_channel_id no está permitido en las reservas de la web.");
  }

  const body: ReservationRequest = { ...req };
  if (isTestMode()) {
    body.api_test = process.env.REDFORTS_TEST_EMAIL?.trim() || true;
    console.warn(
      `[redforts] ⚠️  RESERVA DE PRUEBA (api_test) — no se crea en el PMS. Notificación a: ${
        body.api_test === true ? "nadie" : body.api_test
      }`,
    );
  } else {
    console.info("[redforts] reserva REAL", { arrival: req.arrival, departure: req.departure, accos: req.accos.length });
  }

  return redforts<ReservationResponse>("reservation", body);
}
