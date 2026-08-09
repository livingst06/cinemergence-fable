"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { DemandeInscriptionButton } from "@/features/inscriptions/DemandeInscriptionButton";
import {
  formatFormationSessionLabel,
  isGeneratedSessionLabel,
} from "@/lib/inscription-status";
import type { FormationSessionView } from "@/lib/places";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

type FormationSessionsSectionProps = {
  formationSlug: string;
  paymentEnabled: boolean;
  sessions: FormationSessionView[];
};

export function FormationSessionsSection({
  formationSlug,
  paymentEnabled,
  sessions,
}: FormationSessionsSectionProps) {
  const activeSessions = sessions.filter((s) => s.active);

  return (
    <section id="sessions" className="scroll-mt-28">
      <div className="max-w-3xl">
        <p className="eyebrow mb-3">Sessions</p>
        <h2 className="section-title text-cream">Toutes les sessions</h2>
        <p className="mt-3 text-sm text-muted-text md:text-base">
          Tu t’inscris à une session datée, pas à la formation entière. Choisis
          tes dates puis réserve ta place.
        </p>
      </div>

      {activeSessions.length === 0 ? (
        <p className="mt-8 text-sm text-muted-text">
          Aucune session ouverte pour le moment.
        </p>
      ) : (
        <Accordion className="mt-8 w-full max-w-3xl space-y-3">
          {activeSessions.map((session) => {
            const sessionLabel = formatFormationSessionLabel(
              session.dateDebut,
              session.dateFin,
              { month: "long" },
            );
            const value = `session-${session.id}`;
            const canPay = paymentEnabled || session.tarifEuros != null;

            return (
              <AccordionItem
                key={value}
                value={value}
                className="overflow-hidden rounded-2xl border border-projector/25 bg-gradient-to-br from-projector/10 via-transparent to-transparent last:border-b"
              >
                <div className="px-4 pt-4 sm:px-5 sm:pt-5">
                  <AccordionTrigger
                    className={cn(
                      "items-center gap-4 py-0 hover:no-underline",
                      "rounded-none border-0 focus-visible:ring-offset-0",
                      "**:data-[slot=accordion-trigger-icon]:hidden",
                    )}
                  >
                    <div className="min-w-0 flex-1 text-left">
                      {session.label && !isGeneratedSessionLabel(session.label) ? (
                        <p className="text-xs font-medium text-or-light">
                          {session.label}
                        </p>
                      ) : null}
                      <p className="font-heading text-xl leading-snug text-cream sm:text-2xl">
                        {sessionLabel ?? "Session — dates à confirmer"}
                      </p>
                      <p
                        className={
                          session.placesRestantes != null &&
                          session.placesRestantes > 0
                            ? "mt-1 text-sm font-semibold text-emerald-800 dark:text-emerald-300"
                            : "mt-1 text-sm font-semibold text-muted-text"
                        }
                      >
                        {session.placesRestantes == null
                          ? "Places à confirmer"
                          : session.placesRestantes > 0
                            ? `Il reste ${session.placesRestantes} place${session.placesRestantes > 1 ? "s" : ""}`
                            : "Complet"}
                      </p>
                    </div>
                    <span
                      aria-hidden
                      className={cn(
                        "btn-outline-warm inline-flex size-12 shrink-0 items-center justify-center rounded-xl",
                        "text-cream transition-colors",
                        "group-aria-expanded/accordion-trigger:border-or/45 group-aria-expanded/accordion-trigger:bg-or/15 group-aria-expanded/accordion-trigger:text-or-light",
                      )}
                    >
                      <ChevronDown className="size-6 group-aria-expanded/accordion-trigger:hidden" />
                      <ChevronUp className="hidden size-6 group-aria-expanded/accordion-trigger:inline" />
                    </span>
                  </AccordionTrigger>

                  <div className="mt-4 pb-5">
                    <DemandeInscriptionButton
                      sessionId={session.id}
                      formationSlug={formationSlug}
                      placesRestantes={session.placesRestantes}
                      alreadyRequested={session.alreadyEnrolled}
                      checkoutPending={session.checkoutPending}
                      pendingInscriptionId={session.pendingInscriptionId}
                      paymentEnabled={canPay}
                      className="min-w-[12rem] px-6"
                      size="default"
                    />
                  </div>
                </div>

                <AccordionContent className="border-t border-border/60 px-5 pb-4 pt-3 text-muted-text">
                  <p className="text-sm">
                    Capacité {session.placesOffertes} place
                    {session.placesOffertes !== 1 ? "s" : ""}.
                    {session.tarifEuros != null
                      ? ` Tarif : ${session.tarifEuros.toLocaleString("fr-FR")} €.`
                      : null}
                  </p>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <div className="mt-8 flex flex-col items-start gap-3">
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
      </div>
    </section>
  );
}
