"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Mail } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { AdminDeleteButton, AdminEditButton } from "@/features/admin/AdminMutationButtons";
import { SessionCompletBadge } from "@/features/formations/SessionCompletBadge";
import { InscriptionStatusBadge } from "@/features/inscriptions/InscriptionStatusBadge";
import { formationPath } from "@/lib/defaults";
import {
  formatFormationSessionLabel,
  isGeneratedSessionLabel,
  normalizeInscriptionStatus,
} from "@/lib/inscription-status";
import {
  isSessionFull,
  pastelForId,
  sessionOccupancyRatio,
} from "@/lib/session-calendar";
import { cn } from "@/lib/utils";

export type AdminSessionTrainee = {
  id: number | string;
  userName: string;
  userEmail: string;
  status: string;
  amountEuros: number | null;
};

export type AdminSessionStaff = {
  id: number | string;
  nom: string;
  role: string;
  slug: string;
};

export type AdminSessionGroup = {
  sessionId: number | string;
  formationId: number | string;
  label: string | null;
  formationTitre: string;
  formationSlug: string;
  dateDebut: string;
  dateFin: string;
  placesOffertes: number;
  tarifEuros: number | null;
  active: boolean;
  trainees: AdminSessionTrainee[];
  formateurs: AdminSessionStaff[];
  intervenants: AdminSessionStaff[];
};

function isEnrolled(status: string): boolean {
  const s = normalizeInscriptionStatus(status);
  return s === "payee" || s === "validee" || s === "inscrit";
}

/** Exclut annulations / refus du décompte « au total » (plus de place ni de demande active). */
function isActiveTrainee(status: string): boolean {
  const s = normalizeInscriptionStatus(status);
  return s !== "annule" && s !== "refusee";
}

function participantEmails(trainees: AdminSessionTrainee[]): string[] {
  const emails = new Set<string>();
  for (const t of trainees) {
    if (!isEnrolled(t.status)) continue;
    const email = t.userEmail.trim();
    if (!email || email === "—") continue;
    emails.add(email);
  }
  return [...emails];
}

function buildMailto(args: {
  emails: string[];
  formationTitre: string;
  sessionLabel: string | null;
}): string | null {
  if (args.emails.length === 0) return null;
  const subject = encodeURIComponent(
    args.sessionLabel
      ? `${args.formationTitre} — ${args.sessionLabel}`
      : args.formationTitre,
  );
  const to = args.emails.map((email) => encodeURIComponent(email)).join(",");
  return `mailto:${to}?subject=${subject}`;
}

function SessionStaffSection({
  title,
  emptyLabel,
  people,
}: {
  title: string;
  emptyLabel: string;
  people: AdminSessionStaff[];
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-text">
        {title}
      </p>
      {people.length === 0 ? (
        <p className="mt-1.5 text-sm text-muted-text">{emptyLabel}</p>
      ) : (
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {people.map((p) => (
            <li key={String(p.id)}>
              <span className="inline-flex items-center rounded-full border border-or/30 bg-or/10 px-3 py-1 text-sm font-medium text-or-light">
                {p.nom}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminDemandesPanel({
  sessions,
  isAdminMode = false,
  onEdit,
  onDelete,
  expandedSessionId = null,
  onExpandedSessionIdChange,
}: {
  sessions: AdminSessionGroup[];
  isAdminMode?: boolean;
  onEdit?: (session: AdminSessionGroup) => void;
  onDelete?: (session: AdminSessionGroup) => void;
  /** Si défini, contrôle l’item ouvert (`session-{id}`). */
  expandedSessionId?: number | string | null;
  onExpandedSessionIdChange?: (sessionId: number | string | null) => void;
}) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-text">
        Aucune session pour le moment.
      </p>
    );
  }

  const accordionValue =
    expandedSessionId != null ? [`session-${expandedSessionId}`] : [];

  return (
    <Accordion
      className="w-full space-y-3 overflow-visible pt-3 pr-3"
      value={onExpandedSessionIdChange ? accordionValue : undefined}
      onValueChange={
        onExpandedSessionIdChange
          ? (next) => {
              const raw = next[0];
              if (!raw || typeof raw !== "string") {
                onExpandedSessionIdChange(null);
                return;
              }
              const id = raw.replace(/^session-/, "");
              onExpandedSessionIdChange(id);
            }
          : undefined
      }
    >
      {sessions.map((session) => {
        const sessionLabel = formatFormationSessionLabel(
          session.dateDebut,
          session.dateFin,
          { month: "long" },
        );
        const enrolledCount = session.trainees.filter((t) =>
          isEnrolled(t.status),
        ).length;
        const activeTraineeCount = session.trainees.filter((t) =>
          isActiveTrainee(t.status),
        ).length;
        const fillRatio = sessionOccupancyRatio(
          enrolledCount,
          session.placesOffertes,
        );
        const fillPct = Math.round(fillRatio * 100);
        const full = isSessionFull(enrolledCount, session.placesOffertes);
        const pastel = pastelForId(session.formationId);
        const canDelete = isAdminMode && enrolledCount === 0;
        const emails = participantEmails(session.trainees);
        const mailto = buildMailto({
          emails,
          formationTitre: session.formationTitre,
          sessionLabel,
        });
        const value = `session-${session.sessionId}`;

        return (
          <AccordionItem
            key={value}
            value={value}
            id={value}
            className="relative overflow-visible border-0 bg-transparent last:border-b-0"
          >
            {isAdminMode ? (
              <AdminDeleteButton
                className="absolute -top-3 -right-3 z-30"
                label={`Supprimer ${session.formationTitre}`}
                disabled={!canDelete}
                disabledReason="Impossible : au moins un stagiaire est inscrit"
                onClick={() => onDelete?.(session)}
              />
            ) : null}

            <div
              className={cn(
                "relative overflow-hidden rounded-2xl border border-border",
                "dark:!bg-[var(--session-empty-dark)]",
              )}
              style={
                {
                  backgroundColor: pastel.empty,
                  ["--session-empty-dark"]: pastel.emptyDark,
                  ["--session-fill"]: pastel.fill,
                  ["--session-fill-dark"]: pastel.fillDark,
                } as CSSProperties
              }
              aria-label={`${session.formationTitre}, ${enrolledCount} place${enrolledCount !== 1 ? "s" : ""} sur ${session.placesOffertes}, ${fillPct} % remplies`}
            >
              {fillRatio > 0 ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 bg-[var(--session-fill)] transition-[width] duration-500 ease-out dark:bg-[var(--session-fill-dark)]"
                  style={{ width: `${fillPct}%` }}
                />
              ) : null}

              <div className="relative z-10">
                <div className="px-4 pt-4 sm:px-5 sm:pt-5">
                  <div className="flex w-full items-center gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading text-xl leading-snug text-cream sm:text-2xl">
                          {session.formationTitre}
                        </p>
                        {full ? <SessionCompletBadge tone="admin" /> : null}
                      </div>
                      {session.label && !isGeneratedSessionLabel(session.label) ? (
                        <p className="mt-0.5 text-xs text-or-light">
                          {session.label}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm text-muted-text">
                        {sessionLabel ?? "Session — dates à confirmer"}
                        {" · "}
                        {enrolledCount} inscrit
                        {enrolledCount !== 1 ? "s" : ""}
                        {activeTraineeCount !== enrolledCount
                          ? ` · ${activeTraineeCount} au total`
                          : ""}
                        {" · "}
                        capacité {session.placesOffertes}
                        {fillPct > 0 ? ` · ${fillPct} %` : ""}
                        {!session.active ? " · fermée" : ""}
                      </p>
                    </div>

                    {isAdminMode ? (
                      <AdminEditButton
                        className="shrink-0"
                        label={`Modifier ${session.formationTitre}`}
                        onClick={() => onEdit?.(session)}
                      />
                    ) : null}

                    <AccordionTrigger
                      aria-label={
                        sessionLabel
                          ? `Ouvrir ou fermer ${session.formationTitre} — ${sessionLabel}`
                          : `Ouvrir ou fermer ${session.formationTitre}`
                      }
                      headerClassName="shrink-0"
                      className={cn(
                        "size-12 shrink-0 flex-none items-center justify-center p-0 hover:no-underline",
                        "rounded-xl border-0 focus-visible:ring-offset-0",
                        "**:data-[slot=accordion-trigger-icon]:hidden",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "btn-outline-warm inline-flex size-12 items-center justify-center rounded-xl",
                          "text-cream transition-colors",
                          "group-aria-expanded/accordion-trigger:border-or/45 group-aria-expanded/accordion-trigger:bg-or/15 group-aria-expanded/accordion-trigger:text-or-light",
                        )}
                      >
                        <ChevronDown className="size-6 group-aria-expanded/accordion-trigger:hidden" />
                        <ChevronUp className="hidden size-6 group-aria-expanded/accordion-trigger:inline" />
                      </span>
                    </AccordionTrigger>
                  </div>

                  <div className="mt-3 pb-4">
                    {mailto ? (
                      <a
                        href={mailto}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "btn-outline-warm inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider",
                        )}
                      >
                        <Mail className="size-3.5" aria-hidden />
                        Envoyer un mail aux participants
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="btn-outline-warm inline-flex cursor-not-allowed items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider opacity-50"
                      >
                        <Mail className="size-3.5" aria-hidden />
                        Envoyer un mail aux participants
                      </button>
                    )}
                  </div>
                </div>

                <AccordionContent className="border-t border-border/60 px-0 pb-0">
                  <div className="space-y-5 px-5 py-4">
                    <SessionStaffSection
                      title="Les formateurs lors de cette session"
                      emptyLabel="Aucun formateur"
                      people={session.formateurs}
                    />
                    <SessionStaffSection
                      title="Les intervenants pendant la session"
                      emptyLabel="Aucun intervenant"
                      people={session.intervenants}
                    />
                  </div>

                  <div className="border-t border-border/60">
                    {session.trainees.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-muted-text">
                        Aucun stagiaire sur cette session.
                      </p>
                    ) : (
                      <ul className="divide-y divide-border/60">
                        {session.trainees.map((t) => (
                          <li
                            key={String(t.id)}
                            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-cream">
                                {t.userName || t.userEmail}
                              </p>
                              {t.userName ? (
                                <p className="truncate text-xs text-muted-text">
                                  {t.userEmail}
                                </p>
                              ) : null}
                              {t.amountEuros != null ? (
                                <p className="mt-0.5 text-xs text-muted-text">
                                  {t.amountEuros.toLocaleString("fr-FR")} €
                                </p>
                              ) : null}
                            </div>
                            <InscriptionStatusBadge status={t.status} />
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="border-t border-border/60 px-5 py-3">
                      <Link
                        href={formationPath(session.formationSlug)}
                        className="text-xs font-medium text-or-light underline-offset-2 hover:underline"
                      >
                        Voir la fiche formation
                      </Link>
                    </div>
                  </div>
                </AccordionContent>
              </div>
            </div>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
