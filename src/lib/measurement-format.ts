import { KHEIRON_ITEM_ID, KHEIRON_ITEM_NAME } from "@/lib/kheiron-offer";

export const GA_SESSION_COOKIE = "_ga_TM2QRYKR63";
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

const CID = /^rec[A-Za-z0-9]{14}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type UtmTouch = Partial<Record<(typeof UTM_KEYS)[number], string>>;

export function omitEmpty<T extends Record<string, unknown>>(value: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (item === undefined || item === null || item === "") continue;
    if (Array.isArray(item)) {
      out[key] = item;
      continue;
    }
    if (typeof item === "object") {
      const nested = omitEmpty(item as Record<string, unknown>);
      if (Object.keys(nested).length === 0) continue;
      out[key] = nested;
      continue;
    }
    out[key] = item;
  }
  return out as Partial<T>;
}

export function normalizeEmail(value: string | null | undefined): string | undefined {
  const email = value?.trim().toLowerCase();
  if (!email || !EMAIL.test(email)) return undefined;
  return email;
}

/** 06… et 07… deviennent +33…. Tout autre format repart tel qu'il a été saisi. */
export function internationalPhone(value: string | null | undefined): string | undefined {
  const original = value?.trim();
  if (!original) return undefined;
  const compact = original.replace(/[\s.\-()]/g, "");
  if (/^0[67]\d{8}$/.test(compact)) return `+33${compact.slice(1)}`;
  return original;
}

export function readCookie(cookieHeader: string, name: string): string | undefined {
  for (const part of cookieHeader.split(/; */)) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq) !== name) continue;
    const raw = part.slice(eq + 1);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return undefined;
}

/** `GA1.1.1234567890.1791900000` → `1234567890.1791900000`. */
export function gaClientId(cookie: string | undefined): string | undefined {
  if (!cookie) return undefined;
  const parts = cookie.split(".");
  if (parts.length < 4) return undefined;
  const client = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  return /^\d+\.\d+$/.test(client) ? client : undefined;
}

/**
 * `_ga_TM2QRYKR63` : `GS1.1.1792058000.3…` (3e bloc)
 * ou `GS2.1.s1792058000$o3$…` (chiffres après `s`, jusqu'au premier `$`).
 */
export function gaSessionId(cookie: string | undefined): string | undefined {
  if (!cookie) return undefined;
  if (cookie.startsWith("GS1.")) {
    const block = cookie.split(".")[2];
    return block && /^\d+$/.test(block) ? block : undefined;
  }
  if (cookie.startsWith("GS2.")) {
    const match = cookie.match(/s(\d+)\$/);
    return match?.[1];
  }
  return undefined;
}

export function validCid(value: string | null | undefined): string | undefined {
  const cid = value?.trim();
  return cid && CID.test(cid) ? cid : undefined;
}

export function clip(value: string | undefined, max = 500): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

export function utmFromTouch(touch: Record<string, string> | null | undefined): UtmTouch {
  const utm: UtmTouch = {};
  if (!touch) return utm;
  for (const key of UTM_KEYS) {
    const value = clip(touch[key]);
    if (value) utm[key] = value;
  }
  return utm;
}

export type CheckoutTracking = {
  consent?: string | null;
  fbp?: string;
  fbc?: string;
  gaClientId?: string;
  gaSessionId?: string;
  utm?: UtmTouch;
};

/** Identifiants publicitaires uniquement si le visiteur a accepté. */
export function trackingForConsent(input: CheckoutTracking): CheckoutTracking {
  const utm = input.utm ?? {};
  if (input.consent !== "accepted") {
    return { consent: input.consent, utm };
  }
  return {
    consent: input.consent,
    fbp: clip(input.fbp),
    fbc: clip(input.fbc),
    gaClientId: clip(input.gaClientId),
    gaSessionId: clip(input.gaSessionId),
    utm,
  };
}

export function splitPersonName(name: string | null | undefined): {
  first_name?: string;
  last_name?: string;
} {
  const clean = name?.trim().toLowerCase();
  if (!clean) return {};
  const space = clean.indexOf(" ");
  if (space === -1) return { first_name: clean };
  const last = clean.slice(space + 1).trim();
  return last ? { first_name: clean.slice(0, space), last_name: last } : { first_name: clean };
}

export type PurchaseSession = {
  id: string;
  created?: number;
  livemode?: boolean;
  amount_total?: number | null;
  currency?: string | null;
  payment_link?: string | { id?: string } | null;
  client_reference_id?: string | null;
  metadata?: Record<string, string> | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
    address?: {
      city?: string | null;
      postal_code?: string | null;
      country?: string | null;
    } | null;
  } | null;
  discounts?: Array<{
    coupon?: string | { id?: string; name?: string | null } | null;
    promotion_code?: string | { code?: string | null } | null;
  }> | null;
};

export function paymentLinkId(session: PurchaseSession): string | undefined {
  const link = session.payment_link;
  if (!link) return undefined;
  return typeof link === "string" ? link : link.id;
}

export function couponCode(session: PurchaseSession): string | undefined {
  for (const discount of session.discounts ?? []) {
    const promotion = discount.promotion_code;
    if (promotion && typeof promotion === "object" && promotion.code?.trim()) {
      return promotion.code.trim();
    }
  }
  for (const discount of session.discounts ?? []) {
    const coupon = discount.coupon;
    if (coupon && typeof coupon === "object" && coupon.name?.trim()) return coupon.name.trim();
  }
  return undefined;
}

export function buildPurchasePayload(session: PurchaseSession, pageOrigin: string, eventTime?: number) {
  const metadata = session.metadata ?? {};
  const details = session.customer_details;
  const email = normalizeEmail(details?.email);
  const phone = details?.phone?.trim();
  const address = details?.address;
  const name = splitPersonName(details?.name);
  const city = address?.city?.trim().toLowerCase();
  const postal = address?.postal_code?.trim();
  const country = address?.country?.trim();
  const value = session.amount_total == null ? undefined : session.amount_total / 100;
  const landing = metadata.landing?.startsWith("/") ? metadata.landing : "";
  const origin = pageOrigin.replace(/\/+$/, "");
  const utm = utmFromTouch(metadata);
  const itemId = metadata.offer?.trim() || KHEIRON_ITEM_ID;

  return omitEmpty({
    event_name: "purchase",
    event_id: session.id,
    event_time: eventTime ?? session.created,
    page_location: `${origin}${landing || "/"}`,
    test: session.livemode === false,
    source: paymentLinkId(session) ? "payment_link" : "checkout_site",
    consent: metadata.consent,
    client_id: metadata.ga_client_id,
    ga_session_id: metadata.ga_session_id,
    fbp: metadata.fbp,
    fbc: metadata.fbc,
    ip_override: metadata.ip,
    user_agent_override: metadata.user_agent,
    client_reference_id: session.client_reference_id ?? undefined,
    utm,
    user_data: {
      email_address: email,
      phone_number: phone,
      address: {
        first_name: name.first_name,
        last_name: name.last_name,
        city,
        postal_code: postal,
        country,
      },
    },
    ecommerce: {
      transaction_id: session.id,
      value,
      currency: "EUR",
      coupon: couponCode(session),
      items: [
        {
          item_id: itemId,
          item_name: KHEIRON_ITEM_NAME,
          item_category: "formation",
          price: value,
          quantity: 1,
        },
      ],
    },
  });
}
