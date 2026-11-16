"use client";

import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useMemo } from "react";

let stripePromise: Promise<Stripe | null> | null = null;

function publishableKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  if (!key || key.startsWith("pk_test_")) return undefined;
  return key;
}

function getStripePromise() {
  if (!stripePromise) {
    const key = publishableKey();
    stripePromise = key ? loadStripe(key) : Promise.resolve(null);
  }
  return stripePromise;
}

type StripeEmbeddedCheckoutProps = {
  clientSecret: string;
};

export function StripeEmbeddedCheckout({ clientSecret }: StripeEmbeddedCheckoutProps) {
  const stripe = useMemo(() => getStripePromise(), []);

  if (!publishableKey()) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        Clé publique du compte Stripe de Choukri manquante. Configure{" "}
        <code className="text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> avec
        la clé <code className="text-xs">pk_live_</code> de ce compte.
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
