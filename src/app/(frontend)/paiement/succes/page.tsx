import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { getStripe } from "@/lib/stripe";
import { confirmPaidFromCheckoutSession } from "@/lib/stripe-fulfillment";

type Props = { searchParams: Promise<{ session_id?: string }> };

export const metadata: Metadata = {
  title: "Paiement confirmé",
  robots: { index: false, follow: false },
};

export default async function PaiementSuccesPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;

  let titre: string | null = null;
  let confirmed = false;

  if (sessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      // Filet de secours si le webhook n’a pas encore tourné (stripe listen arrêté, etc.)
      const result = await confirmPaidFromCheckoutSession(session);
      confirmed = result.ok;
      titre = result.titre ?? null;
    } catch (error) {
      console.error("[paiement/succes]", error);
    }
  }

  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <p className="eyebrow justify-center">Confirmation</p>
        <h1 className="section-title text-cream">
          {confirmed ? "Paiement reçu" : "Paiement en cours de confirmation"}
        </h1>
        <p className="text-base leading-relaxed text-muted-text">
          {confirmed
            ? titre
              ? `Ta place pour « ${titre} » est confirmée. Tu peux la retrouver dans tes réservations.`
              : "Ta place est confirmée. Tu peux suivre ta réservation depuis ton espace."
            : "Si tu viens de payer, actualise Mes réservations dans quelques secondes. Dès confirmation Stripe, ta place est inscrite automatiquement."}
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href="/mes-reservations" className="btn-convert">
            Mes réservations
          </ButtonLink>
          <Link
            href="/formations"
            className="text-sm text-muted-text underline-offset-4 hover:text-or-light hover:underline"
          >
            Voir les formations
          </Link>
        </div>
      </div>
    </div>
  );
}
