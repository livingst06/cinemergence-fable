import { isKheironCheckout, isPaidKheironSession, recordKheironPayment } from "@/lib/kheiron-checkout";
import { deliverPurchase } from "@/lib/measurement-log";
import { buildPurchasePayload, type PurchaseSession } from "@/lib/measurement-format";
import { getPublicSiteUrl } from "@/lib/site-url";
import { verifyStripeSignature } from "@/lib/stripe-signature";

type StripeEvent = {
  type?: string;
  created?: number;
  data?: { object?: PurchaseSession & { payment_status?: string } };
};

async function retrieveSession(sessionId: string): Promise<PurchaseSession | null> {
  const key = process.env.STRIPE_KHEIRON_SECRET_KEY?.trim();
  if (!key) return null;
  const params = new URLSearchParams();
  params.append("expand[]", "discounts.promotion_code");
  params.append("expand[]", "discounts.coupon");
  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?${params}`,
    {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    },
  );
  if (!response.ok) return null;
  return (await response.json()) as PurchaseSession;
}

export async function handleStripeWebhook(raw: string, signature: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) return { status: 500, body: { error: "webhook secret missing" } };
  if (!verifyStripeSignature(raw, signature, secret)) {
    return { status: 400, body: { error: "invalid signature" } };
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(raw) as StripeEvent;
  } catch {
    return { status: 400, body: { error: "invalid json" } };
  }

  const type = event.type;
  const incoming = event.data?.object;
  if (
    (type !== "checkout.session.completed" && type !== "checkout.session.async_payment_succeeded") ||
    !incoming?.id
  ) {
    return { status: 200, body: { received: true } };
  }
  if (type === "checkout.session.completed" && incoming.payment_status !== "paid") {
    return { status: 200, body: { received: true } };
  }

  const session = (await retrieveSession(incoming.id)) ?? incoming;
  if (!isKheironCheckout(session)) return { status: 200, body: { received: true } };

  if (isPaidKheironSession(session)) {
    try {
      const seat = await recordKheironPayment(session.id);
      if (!seat.counted && !seat.already) {
        console.error("[stripe-webhook] seat not recorded", session.id);
        return { status: 500, body: { error: "seat not recorded" } };
      }
    } catch (error) {
      console.error("[stripe-webhook] seat", session.id, error instanceof Error ? error.message : error);
      return { status: 500, body: { error: "seat not recorded" } };
    }
  }

  try {
    const payload = buildPurchasePayload(session, getPublicSiteUrl(), event.created);
    await deliverPurchase(session.id, payload);
  } catch (error) {
    console.error("[stripe-webhook] measure", session.id, error instanceof Error ? error.message : error);
  }

  return { status: 200, body: { received: true } };
}
