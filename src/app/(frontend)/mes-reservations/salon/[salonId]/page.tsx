import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PageHero } from "@/components/sections/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { SalonChat } from "@/features/salon/SalonChat";
import { ensurePayloadUserForClerk } from "@/lib/ensure-payload-user";
import { getSalonPageForUser } from "@/lib/session-salon";
import { getSessionProfile } from "@/lib/session-profile";

type Props = { params: Promise<{ salonId: string }> };

export const metadata: Metadata = {
  title: "Salon de discussion",
  robots: { index: false, follow: false },
};

export default async function SessionSalonPage({ params }: Props) {
  const { salonId } = await params;
  const profile = await getSessionProfile();
  if (!profile.clerkUser) {
    redirect(
      `/sign-in?redirect_url=${encodeURIComponent(`/mes-reservations/salon/${salonId}`)}`,
    );
  }

  let payloadUserId = profile.payloadUserId;
  if (!payloadUserId) {
    const user = await ensurePayloadUserForClerk();
    payloadUserId = user?.id ?? null;
  }

  const result = await getSalonPageForUser({
    salonId,
    payloadUserId,
    email: profile.email,
  });

  if (!result.ok && result.reason === "not_found") {
    notFound();
  }

  if (!result.ok) {
    return (
      <>
        <PageHero eyebrow="Espace membre" title="Salon de discussion" />
        <Section>
          <div className="container-page max-w-3xl space-y-4">
            <div className="card-stage space-y-4 p-8">
              <p className="text-sm text-muted-text">
                Ce salon est réservé aux élèves inscrits à cette session.
              </p>
              <ButtonLink href="/mes-reservations" className="btn-outline-warm">
                Retour à mes réservations
              </ButtonLink>
            </div>
          </div>
        </Section>
      </>
    );
  }

  const { salon } = result;

  return (
    <>
      <section className="relative overflow-hidden bg-noir pt-6 pb-4 md:pt-10 md:pb-6">
        <div className="container-page max-w-3xl">
          <ButtonLink
            href="/mes-reservations"
            size="sm"
            className="btn-outline-warm mb-4"
          >
            Retour à mes réservations
          </ButtonLink>
          <p className="eyebrow mb-2">Salon de discussion</p>
          <h1 className="font-heading text-3xl text-cream md:text-4xl">
            {salon.formationTitre}
          </h1>
          {salon.sessionLabel ? (
            <p className="mt-1 text-sm text-muted-text">{salon.sessionLabel}</p>
          ) : null}
        </div>
      </section>
      <Section className="pt-0 md:pt-2">
        <div className="container-page max-w-3xl">
          <SalonChat
            salonId={salon.salonId}
            currentUserId={payloadUserId ? String(payloadUserId) : ""}
            posts={salon.posts}
          />
        </div>
      </Section>
    </>
  );
}
