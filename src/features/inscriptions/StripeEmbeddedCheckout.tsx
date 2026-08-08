"use client";

import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useMemo } from "react";

let stripePromise: Promise<Stripe | null> | null = null;

function getStripePromise() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    stripePromise = key ? loadStripe(key) : Promise.resolve(null);
  }
  return stripePromise;
}

type StripeEmbeddedCheckoutProps = {
  clientSecret: string;
};

export function StripeEmbeddedCheckout({ clientSecret }: StripeEmbeddedCheckoutProps) {
  const stripe = useMemo(() => getStripePromise(), []);

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        Clé Stripe publique manquante. Configure{" "}
        <code className="text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-1 sm:p-2">
      <EmbeddedCheckoutProvider stripe={stripe} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
