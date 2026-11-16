import "server-only";

import Stripe from "stripe";

let stripe: Stripe | null = null;

/** Compte Stripe de production, celui de Choukri. Seul compte utilisé par le site. */
export function getStripeSecretKey(): string {
  const key = process.env.CHOUKRI_STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("CHOUKRI_STRIPE_SECRET_KEY manquant");
  }
  return key;
}

export function getStripe(): Stripe {
  const key = getStripeSecretKey();
  if (!stripe) {
    stripe = new Stripe(key, {
      apiVersion: "2026-07-29.dahlia",
      typescript: true,
    });
  }
  return stripe;
}

export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  if (!key || key.startsWith("pk_test_")) {
    throw new Error(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manquant : clé publiable pk_live_ du compte de Choukri",
    );
  }
  return key;
}

export function eurosToStripeAmount(euros: number): number {
  return Math.trunc(euros) * 100;
}
