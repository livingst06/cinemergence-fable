import { KHEIRON_ITEM_ID, KHEIRON_ITEM_NAME } from "@/lib/kheiron-offer";
import {
  gaClientId,
  gaSessionId,
  GA_SESSION_COOKIE,
  internationalPhone,
  normalizeEmail,
  readCookie,
  utmFromTouch,
  validCid,
} from "@/lib/measurement-format";
import { CONSENT_KEY } from "@/lib/cookie-consent";

function layer() {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

export function pushViewItem(item: { itemId: string; itemName: string; price?: number }) {
  const product: Record<string, unknown> = {
    item_id: item.itemId,
    item_name: item.itemName,
    item_category: "formation",
    quantity: 1,
  };
  if (item.price != null) product.price = item.price;
  const ecommerce: Record<string, unknown> = {
    currency: "EUR",
    items: [product],
  };
  if (item.price != null) ecommerce.value = item.price;
  const dataLayer = layer();
  dataLayer.push({ ecommerce: null });
  dataLayer.push({ event: "view_item", ecommerce });
}

export function pushBeginCheckout(price: number, email?: string) {
  const ecommerce: Record<string, unknown> = {
    currency: "EUR",
    value: price,
    items: [
      {
        item_id: KHEIRON_ITEM_ID,
        item_name: KHEIRON_ITEM_NAME,
        item_category: "formation",
        price,
        quantity: 1,
      },
    ],
  };
  const event: Record<string, unknown> = { event: "begin_checkout", ecommerce };
  const normalized = normalizeEmail(email);
  if (normalized) event.user_data = { email_address: normalized };
  const dataLayer = layer();
  dataLayer.push({ ecommerce: null });
  dataLayer.push(event);
}

export function pushGenerateLead(input: {
  formName: "contact" | "newsletter";
  email?: string;
  phone?: string;
  itemId?: string;
}) {
  const event: Record<string, unknown> = {
    event: "generate_lead",
    form_name: input.formName,
  };
  if (input.itemId) event.item_id = input.itemId;
  const user: Record<string, string> = {};
  const email = normalizeEmail(input.email);
  const phone = internationalPhone(input.phone);
  if (email) user.email_address = email;
  if (phone) user.phone_number = phone;
  if (Object.keys(user).length) event.user_data = user;
  layer().push(event);
}

export function checkoutRequestBody(search: string, touch: Record<string, string> | null, storedFbc: string | null) {
  const params = new URLSearchParams(search);
  let consent: string | null = null;
  try {
    consent = localStorage.getItem(CONSENT_KEY);
  } catch {
    consent = null;
  }
  const accepted = consent === "accepted";
  const cookie = document.cookie;
  const fbp = readCookie(cookie, "_fbp");
  const fbc = readCookie(cookie, "_fbc") || storedFbc || undefined;
  const body: Record<string, unknown> = {
    offer: KHEIRON_ITEM_ID,
    landing: "/formations/kheiron",
    consent,
    utm: utmFromTouch(touch),
  };
  const cid = validCid(params.get("cid"));
  const email = normalizeEmail(params.get("email"));
  if (cid) body.cid = cid;
  if (email) body.email = email;
  if (accepted) {
    if (fbp) body.fbp = fbp;
    if (fbc) body.fbc = fbc;
    const clientId = gaClientId(readCookie(cookie, "_ga"));
    const sessionId = gaSessionId(readCookie(cookie, GA_SESSION_COOKIE));
    if (clientId) body.ga_client_id = clientId;
    if (sessionId) body.ga_session_id = sessionId;
  }
  return body;
}
