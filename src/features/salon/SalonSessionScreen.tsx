import { PageHero } from "@/components/sections/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { SalonChat } from "@/features/salon/SalonChat";
import type { SalonPageView } from "@/lib/session-salon";

type SalonSessionScreenProps = {
  salon: SalonPageView;
  currentUserId: string;
  backHref: string;
  backLabel: string;
};

export function SalonSessionScreen({
  salon,
  currentUserId,
  backHref,
  backLabel,
}: SalonSessionScreenProps) {
  return (
    <>
      <section className="relative overflow-hidden bg-noir pt-6 pb-4 md:pt-10 md:pb-6">
        <div className="container-page max-w-3xl">
          <ButtonLink
            href={backHref}
            size="sm"
            className="btn-outline-warm mb-4"
          >
            {backLabel}
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
            currentUserId={currentUserId}
            posts={salon.posts}
          />
        </div>
      </Section>
    </>
  );
}

export function SalonForbiddenScreen({
  backHref,
  backLabel,
}: {
  backHref: string;
  backLabel: string;
}) {
  return (
    <>
      <PageHero eyebrow="Espace membre" title="Salon de discussion" />
      <Section>
        <div className="container-page max-w-3xl space-y-4">
          <div className="card-stage space-y-4 p-8">
            <p className="text-sm text-muted-text">
              Ce salon est réservé aux élèves inscrits et aux formateurs ou
              intervenants de cette session.
            </p>
            <ButtonLink href={backHref} className="btn-outline-warm">
              {backLabel}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
