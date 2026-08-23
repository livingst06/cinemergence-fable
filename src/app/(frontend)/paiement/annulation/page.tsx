import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { getSessionProfile } from "@/lib/session-profile";

export const metadata: Metadata = {
  title: "Paiement annulé",
  robots: { index: false, follow: false },
};

export default async function PaiementAnnulationPage() {
  const session = await getSessionProfile();
  if (!session.clerkUser) {
    redirect("/sign-in?redirect_url=/paiement/annulation");
  }

  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <h1 className="section-title text-cream">Paiement annulé</h1>
        <p className="text-muted-text">
          Ta place réservée a été libérée. Tu pourras réessayer tant qu’il reste
          des places.
        </p>
        <ButtonLink href="/formations" className="btn-convert">
          Retour aux formations
        </ButtonLink>
      </div>
    </div>
  );
}
