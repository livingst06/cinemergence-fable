import { getKheironOffer } from "@/lib/kheiron-checkout";
import { KHEIRON_ITEM_ID } from "@/lib/kheiron-offer";
import { normalizeEmail, utmFromTouch, validCid, type UtmTouch } from "@/lib/measurement-format";
import { createKheironCheckoutSession, type CheckoutRequest } from "@/lib/stripe-checkout";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function utm(value: unknown): UtmTouch {
  const record = asRecord(value);
  if (!record) return {};
  const touch: Record<string, string> = {};
  for (const [key, item] of Object.entries(record)) {
    if (typeof item === "string") touch[key] = item;
  }
  return utmFromTouch(touch);
}

function clientIp(request: Request): string | undefined {
  const first = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return first || undefined;
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const body = asRecord(raw);
  if (!body || body.offer !== KHEIRON_ITEM_ID) {
    return Response.json({ error: "unknown offer" }, { status: 400 });
  }

  const consent = text(body.consent);
  const input: CheckoutRequest = {
    offer: KHEIRON_ITEM_ID,
    cid: validCid(text(body.cid)),
    email: normalizeEmail(text(body.email)),
    landing: "/formations/kheiron",
    consent: consent === "accepted" || consent === "rejected" ? consent : null,
    fbp: text(body.fbp),
    fbc: text(body.fbc),
    ga_client_id: text(body.ga_client_id),
    ga_session_id: text(body.ga_session_id),
    utm: utm(body.utm),
  };

  try {
    const offer = await getKheironOffer();
    const url = await createKheironCheckoutSession(
      input,
      offer.phase,
      clientIp(request),
      request.headers.get("user-agent") ?? undefined,
    );
    return Response.json({ url });
  } catch (error) {
    console.error("[checkout]", error instanceof Error ? error.message : error);
    return Response.json({ error: "checkout unavailable" }, { status: 502 });
  }
}
