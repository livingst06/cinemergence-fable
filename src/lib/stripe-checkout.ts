import {
  kheironAmountEuros,
  KHEIRON_ITEM_ID,
  KHEIRON_ITEM_NAME,
  type KheironOfferPhase,
} from "@/lib/kheiron-offer";
import { clip, type UtmTouch } from "@/lib/measurement-format";
import { getPublicSiteUrl } from "@/lib/site-url";

export type CheckoutRequest = {
  offer: string;
  cid?: string;
  email?: string;
  landing?: string;
  consent?: string | null;
  fbp?: string;
  fbc?: string;
  ga_client_id?: string;
  ga_session_id?: string;
  utm?: UtmTouch;
};

function formBody(entries: Array<[string, string]>): string {
  return entries
    .map(([key, value]) => {
      const encoded = encodeURIComponent(value).replace(/%7B/gi, "{").replace(/%7D/gi, "}");
      return `${encodeURIComponent(key)}=${encoded}`;
    })
    .join("&");
}

export function checkoutMetadata(
  input: CheckoutRequest,
  ip: string | undefined,
  userAgent: string | undefined,
): Record<string, string> {
  const accepted = input.consent === "accepted";
  const pairs: Record<string, string | undefined> = {
    offer: KHEIRON_ITEM_ID,
    landing: "/formations/kheiron",
    origin: "checkout_site",
    consent: input.consent?.trim() || "none",
    ip: clip(ip),
    user_agent: clip(userAgent),
    utm_source: clip(input.utm?.utm_source),
    utm_medium: clip(input.utm?.utm_medium),
    utm_campaign: clip(input.utm?.utm_campaign),
    utm_content: clip(input.utm?.utm_content),
    utm_term: clip(input.utm?.utm_term),
  };
  if (accepted) {
    pairs.fbp = clip(input.fbp);
    pairs.fbc = clip(input.fbc);
    pairs.ga_client_id = clip(input.ga_client_id);
    pairs.ga_session_id = clip(input.ga_session_id);
  }
  const metadata: Record<string, string> = {};
  for (const [key, value] of Object.entries(pairs)) {
    if (value) metadata[key] = value;
  }
  return metadata;
}

export function checkoutFormBody(
  input: CheckoutRequest,
  phase: KheironOfferPhase,
  ip: string | undefined,
  userAgent: string | undefined,
): string {
  const origin = getPublicSiteUrl();
  const amount = kheironAmountEuros(phase) * 100;
  const entries: Array<[string, string]> = [
    ["mode", "payment"],
    ["locale", "fr"],
    ["success_url", `${origin}/formations/kheiron/merci?session_id={CHECKOUT_SESSION_ID}`],
    ["cancel_url", `${origin}/formations/kheiron`],
    ["phone_number_collection[enabled]", "true"],
    ["billing_address_collection", "auto"],
    ["line_items[0][quantity]", "1"],
    ["line_items[0][price_data][currency]", "eur"],
    ["line_items[0][price_data][unit_amount]", String(amount)],
    ["line_items[0][price_data][product_data][name]", KHEIRON_ITEM_NAME],
  ];
  if (input.cid) entries.push(["client_reference_id", input.cid]);
  if (input.email) entries.push(["customer_email", input.email]);
  for (const [key, value] of Object.entries(checkoutMetadata(input, ip, userAgent))) {
    entries.push([`metadata[${key}]`, value]);
  }
  return formBody(entries);
}

export async function createKheironCheckoutSession(
  input: CheckoutRequest,
  phase: KheironOfferPhase,
  ip: string | undefined,
  userAgent: string | undefined,
): Promise<string> {
  const key = process.env.STRIPE_KHEIRON_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_KHEIRON_SECRET_KEY manquant");
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: checkoutFormBody(input, phase, ip, userAgent),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  const payload = (await response.json()) as { url?: string; error?: { message?: string } };
  if (!response.ok || !payload.url) {
    throw new Error(payload.error?.message || `Stripe checkout ${response.status}`);
  }
  return payload.url;
}
