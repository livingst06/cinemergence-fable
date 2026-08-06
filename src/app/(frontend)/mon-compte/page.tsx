import type { Metadata } from "next";
import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { ensurePayloadUserForClerk } from "@/lib/ensure-payload-user";
import { getSessionProfile } from "@/lib/session-profile";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
};

export default async function MonComptePage() {
  const profile = await getSessionProfile();

  if (!profile.clerkUser) {
    redirect("/sign-in?redirect_url=/mon-compte");
  }

  const user = profile.clerkUser;
  const prenom = user.firstName || user.username || profile.email || "";

  if (!profile.payloadUserId && profile.email) {
    await ensurePayloadUserForClerk();
  }

  return (
    <>
      <PageHero eyebrow="Espace membre" title="Mon compte" />
      <Section>
        <div className="container-page max-w-2xl space-y-8">
          <div className="card-stage p-8">
            <p className="text-lg text-cream">
              Bonjour <span className="text-or-light">{prenom}</span>
            </p>
            <p className="mt-2 text-sm text-muted-text">{profile.email}</p>
            {profile.isAdminEligible && (
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-or-light">
                Compte admin
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/mes-reservations" className="btn-cta">
                Mes réservations
              </ButtonLink>
              {profile.isAdminEligible ? (
                <ButtonLink
                  href="/les-demandes"
                  variant="outline"
                  className="btn-outline-warm"
                >
                  Les demandes
                </ButtonLink>
              ) : null}
              <SignOutButton redirectUrl="/">
                <Button variant="outline" type="button" className="btn-outline-warm">
                  Je me déconnecte
                </Button>
              </SignOutButton>
            </div>
          </div>

          <div className="card-stage p-8">
            <h2 className="font-heading text-2xl text-cream">Profil</h2>
            <p className="mt-2 text-sm text-muted-text text-pretty">
              Suivez vos demandes d&apos;inscription et leurs statuts depuis
              Mes réservations.
            </p>
            <div className="mt-6">
              <ButtonLink href="/formations" variant="outline" className="btn-outline-warm">
                Voir les formations
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
