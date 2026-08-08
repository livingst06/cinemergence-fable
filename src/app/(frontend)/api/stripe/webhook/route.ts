import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  confirmPaidFromCheckoutSession,
  releaseHoldFromCheckoutSession,
} from "@/lib/stripe-fulfillment";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error("[stripe.webhook] signature", error);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await confirmPaidFromCheckoutSession(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        await releaseHoldFromCheckoutSession(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("[stripe.webhook] handler", event.type, error);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
