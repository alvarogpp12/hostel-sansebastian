/**
 * Tipos de la Redforts Booking API v5 (especificación del 2024-04-02).
 *
 * Los nombres de campo son los de la API, en snake_case, para poder copiar
 * respuestas y peticiones tal cual. Los "?" de la especificación son `?:` aquí
 * y los "#" (puede ser null) son `| null`.
 */

/** YYYY-MM-DD */
export type IsoDate = string;
/** HH:MM en 24 h */
export type IsoTime = string;
/** ISO-639-1 en minúsculas: "es", "en"… */
export type Lang = string;

export type RedfortsErrorItem = {
  code: number;
  /** Siempre en inglés: la traducción está en Inventory Texts → errors */
  text: string;
  values?: (string | number)[];
};

type WithErrors = { api_version?: number; errors?: RedfortsErrorItem[] };

/* ── Inventory ─────────────────────────────────────────────────────────── */

export type InventoryAcco = { name: string; amount: number; adults: number; children: number; images: number[] };
export type InventoryField = {
  id:
    | "firstnames"
    | "middlenames"
    | "surname"
    | "surname2"
    | "address"
    | "postalcode"
    | "town"
    | "state"
    | "country"
    | "email"
    | "phone"
    | "phone2"
    | "arrival_time"
    | "departure_time"
    | "card_issuer"
    | "card_number"
    | "card_expires"
    | "card_holder"
    | "card_csc";
  required: boolean;
};
export type InventoryImage = { url: string; thumbnail_url: string };
export type InventoryItem = { name: string; images: number[]; may_offer: boolean };
export type InventoryPromo = {
  percentage: number;
  stay_start?: IsoDate;
  stay_end?: IsoDate;
  offer_start?: IsoDate;
  offer_end?: IsoDate;
  use_remain?: number;
};
export type InventoryRate = { name: string; adults?: number; children?: number };
export type InventoryNamedTexts = { name?: string; description?: string };
export type InventoryRateTexts = InventoryNamedTexts & { cancellation?: string; payment?: string };

export type InventoryTexts = {
  accos: Record<string, InventoryNamedTexts>;
  checkinout: string | null;
  conditions: string | null;
  consent_text?: string;
  consent_title?: string;
  /** REDFORTS-DUDA: la especificación dice códigos en mayúsculas, el ejemplo los trae en minúsculas */
  countries: Record<string, string>;
  errors: Record<string, string>;
  images: Record<string, InventoryNamedTexts>;
  /** REDFORTS-DUDA: la especificación remite aquí a "Inventory Rate Texts" (¿errata por Item Texts?) */
  items: Record<string, InventoryRateTexts>;
  language: string;
  note_text: string | null;
  privacy: string | null;
  privacy_summary: string | null;
  rates: Record<string, InventoryRateTexts>;
};

export type InventoryResponse = WithErrors & {
  accos: Record<string, InventoryAcco>;
  allow_children: boolean;
  be_code: string;
  card_issuers?: string[];
  checkin_from: IsoTime;
  checkin_to?: IsoTime;
  checkout: IsoTime;
  /** REDFORTS-DUDA: aquí es un objeto; en Availability, un código ISO-4217 */
  currency: { before: boolean; digits: number; symbol: string };
  default_lang: Lang;
  fields: InventoryField[];
  images: Record<string, InventoryImage>;
  items: Record<string, InventoryItem>;
  languages: Record<Lang, InventoryTexts>;
  promos: Record<string, InventoryPromo>;
  rates: Record<string, InventoryRate>;
  version: number;
};

/* ── Calendar Data ─────────────────────────────────────────────────────── */

export type CalendarDataRequest = { acco_id?: number };
export type CalendarDataResponse = WithErrors & {
  acco_id?: number;
  /** Un carácter por día desde first_date: "-" nada libre, "0" libre sin llegada, "1" se puede llegar */
  dates_info: string;
  first_date: IsoDate;
  last_date: IsoDate;
  first_weekend_day: number;
  last_weekend_day: number;
  inventory_version: number;
};

/* ── Availability ──────────────────────────────────────────────────────── */

export type AvailabilityRequest = {
  arrival: IsoDate;
  departure: IsoDate;
  acco_id?: number;
  clean_only?: boolean;
  promo?: string;
};
export type AvailabilityPeriod = { rate_id: number; days: number; price: number; orig_price?: number };
export type AvailabilityOption = {
  arrival: IsoDate;
  departure: IsoDate;
  acco_id: number;
  /** Cuántas unidades de este alojamiento quedan libres */
  amount: number;
  adults: number;
  children: number;
  /** Precio de la opción para UNA unidad del alojamiento */
  price: number;
  orig_price?: number;
  promo_amount?: number;
  /** % de impuestos NO incluidos en price; null = todo incluido */
  excl_taxes: number | null;
  prepayment_required: boolean;
  periods: AvailabilityPeriod[];
  ota_prices?: Record<string, number>;
};
export type AvailabilityResponse = WithErrors & {
  clean_only?: boolean;
  currency?: string;
  options?: AvailabilityOption[];
  promo_total?: number;
  inventory_version?: number;
};

/* ── Items ─────────────────────────────────────────────────────────────── */

export type ItemListRequest =
  | { arrival: IsoDate; departure: IsoDate; adults: number; children: number }
  | { reserv_id: number; arrival: IsoDate; email: string }
  | { reserv_id: number; arrival: IsoDate; name: string };
export type ItemListInfo = {
  id: number;
  price: number;
  excl_taxes: number | null;
  daily: boolean;
  quantity?: number;
  min: number;
  max: number | null;
  may_offer: boolean;
};
export type ItemListResponse = WithErrors & {
  currency?: string;
  days?: number;
  items?: ItemListInfo[];
  inventory_version?: number;
};

export type ItemsUpdateInfo = { id: number; quantity: number };
export type ItemsUpdateRequest = { reserv_id: number; arrival: IsoDate; items: ItemsUpdateInfo[]; lang?: Lang } & (
  | { email: string }
  | { name: string }
);
export type ItemsUpdateResponse = WithErrors & { status: "ok" | "error" };

/* ── Reservation ───────────────────────────────────────────────────────── */

export type ReservationPeriod = { rate_id: number; days: number; price?: number; orig_price?: number };
export type ReservationAcco = {
  acco_id: number;
  periods: ReservationPeriod[];
  adults: number;
  children?: number;
  /** Total de la estancia para esta unidad */
  price: number;
};

/** Datos del huésped. Nunca se envían campos card_*: el pago lo gestiona Stripe. */
export type ReservationGuest = {
  firstnames?: string;
  middlenames?: string;
  surname: string;
  surname2?: string;
  gender?: "M" | "F";
  address?: string;
  postalcode?: string;
  town?: string;
  state?: string;
  country?: string;
  email: string;
  email2?: string;
  phone?: string;
  phone2?: string;
  nationality?: string;
  id_number?: string;
  id_issued?: IsoDate;
  id_expires?: IsoDate;
  arrival_time?: IsoTime;
  departure_time?: IsoTime;
};

export type ReservationRequest = ReservationGuest & {
  api_test?: boolean | string;
  arrival: IsoDate;
  departure: IsoDate;
  accos: ReservationAcco[];
  clean_only?: boolean;
  ignore_prepayment?: boolean;
  items?: ItemsUpdateInfo[];
  lang: Lang;
  notes?: string;
  promo?: string;
  sales_channel_id?: number;
  status: "confirmed" | "unconfirmed";
  consent?: boolean;
};
export type ReservationResponse = WithErrors & {
  status: "confirmed" | "unconfirmed" | "error";
  id?: number;
  clean_only?: boolean;
  prepayment_required?: boolean;
  url?: string;
};

/* ── Reservation Data ──────────────────────────────────────────────────── */

export type ReservationDataRequest = { reserv_id: number; arrival: IsoDate } & ({ email: string } | { name: string });
export type ReservationDataResponse = WithErrors &
  Partial<Omit<ReservationGuest, "surname" | "email">> & {
    currency?: string;
    arrival?: IsoDate;
    departure?: IsoDate;
    arrival_time?: IsoTime;
    departure_time?: IsoTime;
    days?: number;
    accos?: ReservationAcco[];
    items?: ItemListInfo[];
    promo?: string;
    status?: "confirmed" | "unconfirmed";
    url?: string;
    surname?: string;
    email?: string;
    consent?: boolean;
    card_issuer?: string;
    card_number?: string;
    card_expires?: IsoDate;
    card_holder?: string;
    inventory_version?: number;
  };

/* ── Sales Channels ────────────────────────────────────────────────────── */

export type SalesChannelsResponse = Record<string, string>;
