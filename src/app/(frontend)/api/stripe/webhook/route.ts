import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { recordCheckoutPaiement } from "@/lib/paiements";
import { releaseHoldFromCheckoutSession } from "@/lib/stripe-fulfillment";
import { getStripe } from "@/lib/stripe";
import { handleStripeWebhook } from "@/lib/stripe-webhook";

export const runtime = "nodejs";

function isSignatureError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error != null &&
    "type" in error &&
    (error as { type?: string }).type === "StripeSignatureVerificationError"
  );
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (process.env.CHOUKRI_STRIPE_SECRET_KEY?.trim() && secret && signature) {
    try {
      const stripe = getStripe();
      const event = stripe.webhooks.constructEvent(raw, signature, secret);
      const checkout = event.data.object as Stripe.Checkout.Session;
      const isFormationCheckout = Boolean(checkout?.metadata?.inscriptionId);
      try {
        if (isFormationCheckout) {
          switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded": {
              const paid =
                event.type === "checkout.session.async_payment_succeeded" ||
                checkout.payment_status === "paid";
              if (paid && checkout.id) {
                const paiement = await recordCheckoutPaiement(checkout.id);
                if (!paiement.recorded) {
                  throw new Error(`paiement ${paiement.reason}`);
                }
              }
              break;
            }
            case "checkout.session.expired":
            case "checkout.session.async_payment_failed": {
              await releaseHoldFromCheckoutSession(checkout);
              break;
            }
            default:
              break;
          }
        }
      } catch (error) {
        console.error("[stripe.webhook] handler", event.type, error);
        return NextResponse.json({ error: "Handler error" }, { status: 500 });
      }
    } catch (error) {
      if (!isSignatureError(error)) {
        console.error("[stripe.webhook] signature", error);
        return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
      }
    }
  }

  const result = await handleStripeWebhook(raw, signature);
  return Response.json(result.body, { status: result.status });
}
