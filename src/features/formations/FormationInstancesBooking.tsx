"use client";

import { DemandeInscriptionButton } from "@/features/inscriptions/DemandeInscriptionButton";
import { FormationSessionBanner } from "@/features/formations/FormationSessionBanner";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { formatFormationSessionLabel } from "@/lib/inscription-status";
import type { FormationInstanceView } from "@/lib/places";

type FormationInstancesBookingProps = {
  formationSlug: string;
  paymentEnabled: boolean;
  instances: FormationInstanceView[];
  /** Fallback si aucune instance CMS (legacy catalogue) */
  fallback?: {
    sessionLabel?: string | null;
    placesRestantes: number | null;
  };
};

export function FormationInstancesBooking({
  formationSlug,
  paymentEnabled,
  instances,
  fallback,
}: FormationInstancesBookingProps) {
  const activeInstances = instances.filter((i) => i.active);

  if (activeInstances.length === 0) {
    return (
      <div className="w-full max-w-2xl space-y-5">
        {fallback ? (
          <FormationSessionBanner
            sessionLabel={fallback.sessionLabel}
            placesRestantes={fallback.placesRestantes}
          />
        ) : null}
        <div className="flex w-full flex-col items-center gap-3">
          <p className="text-center text-sm text-muted-text">
            Aucune session ouverte pour le moment.
          </p>
          <ContactLinks formationSlug={formationSlug} />
        </div>
      </div>
    );
  }

  if (activeInstances.length === 1) {
    const instance = activeInstances[0]!;
    const sessionLabel = formatFormationSessionLabel(
      instance.dateDebut,
      instance.dateFin,
      { month: "long" },
    );
    return (
      <div className="w-full max-w-2xl space-y-5">
        <FormationSessionBanner
          sessionLabel={sessionLabel}
          placesRestantes={instance.placesRestantes}
        />
        <div className="flex w-full flex-col items-center gap-3">
          <DemandeInscriptionButton
            instanceId={instance.id}
            formationSlug={formationSlug}
            placesRestantes={instance.placesRestantes}
            alreadyRequested={instance.alreadyEnrolled}
            checkoutPending={instance.checkoutPending}
            pendingInscriptionId={instance.pendingInscriptionId}
            paymentEnabled={paymentEnabled || instance.tarifEuros != null}
            className="min-w-[14rem] px-8"
          />
          <ContactLinks formationSlug={formationSlug} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-projector-light">
        Sessions disponibles
      </p>
      <ul className="space-y-4">
        {activeInstances.map((instance) => {
          const sessionLabel = formatFormationSessionLabel(
            instance.dateDebut,
            instance.dateFin,
            { month: "long" },
          );
          return (
            <li
              key={String(instance.id)}
              className="rounded-2xl border border-projector/25 bg-gradient-to-br from-projector/15 via-projector/5 to-transparent p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  {instance.label ? (
                    <p className="text-xs font-medium text-or-light">{instance.label}</p>
                  ) : null}
                  <p className="font-heading text-xl leading-snug text-cream sm:text-2xl">
                    {sessionLabel ?? "Dates à confirmer"}
                  </p>
                  <p
                    className={
                      instance.placesRestantes != null && instance.placesRestantes > 0
                        ? "mt-1 text-sm font-semibold text-emerald-800 dark:text-emerald-300"
                        : "mt-1 text-sm font-semibold text-muted-text"
                    }
                  >
                    {instance.placesRestantes == null
                      ? "Places à confirmer"
                      : instance.placesRestantes > 0
                        ? `Il reste ${instance.placesRestantes} place${instance.placesRestantes > 1 ? "s" : ""}`
                        : "Complet"}
                  </p>
                </div>
                <DemandeInscriptionButton
                  instanceId={instance.id}
                  formationSlug={formationSlug}
                  placesRestantes={instance.placesRestantes}
                  alreadyRequested={instance.alreadyEnrolled}
                  checkoutPending={instance.checkoutPending}
                  pendingInscriptionId={instance.pendingInscriptionId}
                  paymentEnabled={paymentEnabled || instance.tarifEuros != null}
                  className="min-w-[12rem] shrink-0 px-6"
                  size="default"
                />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex w-full flex-col items-center gap-3">
        <ContactLinks formationSlug={formationSlug} />
      </div>
    </div>
  );
}

function ContactLinks({ formationSlug }: { formationSlug: string }) {
  return (
    <>
      <ButtonLink
        href={`/contact?formation=${formationSlug}&type=inscription`}
        variant="link"
        size="sm"
        className="h-auto px-0 text-sm font-medium text-muted-text hover:text-or-light"
      >
        Je pose une question
      </ButtonLink>
      <ButtonLink
        href="/financement"
        variant="link"
        size="sm"
        className="h-auto px-0 text-sm font-medium text-muted-text hover:text-or-light"
      >
        Je vérifie mon financement
      </ButtonLink>
    </>
  );
}
