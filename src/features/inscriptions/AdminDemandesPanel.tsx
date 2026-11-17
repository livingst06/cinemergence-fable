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
import { AdminDeleteButton, AdminEditButton } from "@/features/admin/AdminMutationButtons";
import { SessionCompletBadge } from "@/features/formations/SessionCompletBadge";
import { UserAvatar } from "@/features/profile/UserAvatar";
import { pastelForFormationName } from "@/lib/formation-pastel";
import { formationPath } from "@/lib/formation-types";
import {
  formatFormationSessionLabel,
  isGeneratedSessionLabel,
  normalizeInscriptionStatus,
} from "@/lib/inscription-status";
import {
  isSessionFull,
  sessionOccupancyRatio,
} from "@/lib/session-calendar";
import { cn } from "@/lib/utils";

export type AdminSessionTrainee = {
  id: number | string;
  userName: string;
  userEmail: string;
  avatarKey: string | null;
  status: string;
  amountEuros: number | null;
};

export type AdminSessionStaff = {
  id: number | string;
  nom: string;
  email: string | null;
  photoUrl: string | null;
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

function traineeEmails(trainees: AdminSessionTrainee[]): string[] {
  const emails = new Set<string>();
  for (const t of trainees) {
    if (!isEnrolled(t.status)) continue;
    const email = t.userEmail.trim();
    if (!email || email === "—") continue;
    emails.add(email);
  }
  return [...emails];
}

function staffEmails(people: AdminSessionStaff[]): string[] {
  const emails = new Set<string>();
  for (const p of people) {
    const email = p.email?.trim();
    if (!email) continue;
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

function SessionMailtoButton({
  href,
  label,
  shortLabel,
  disabledReason,
}: {
  href: string | null;
  label: string;
  shortLabel: string;
  disabledReason: string;
}) {
  const className = cn(
    "btn-outline-warm inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap sm:w-auto",
    !href && "pointer-events-none cursor-not-allowed opacity-50",
  );
  const content = (
    <>
      <Mail className="size-3.5 shrink-0" aria-hidden />
      <span className="sm:hidden">{shortLabel}</span>
      <span className="hidden sm:inline">{label}</span>
    </>
  );
  if (href) {
    return (
      <a href={href} aria-label={label} className={className}>
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      disabled
      title={disabledReason}
      aria-label={label}
      className={className}
    >
      {content}
    </button>
  );
}

function staffInitials(nom: string): string {
  const parts = nom.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return letters || "?";
}

function SessionElevesSection({ trainees }: { trainees: AdminSessionTrainee[] }) {
  const enrolled = trainees.filter((trainee) => isEnrolled(trainee.status));
  return (
    <div>
      <p className="label-copy">Les élèves inscrits</p>
      {enrolled.length === 0 ? (
        <p className="mt-1.5 text-sm text-muted-text">Aucun élève</p>
      ) : (
        <ul className="mt-2.5 flex flex-wrap gap-3">
          {enrolled.map((trainee) => {
            const label = trainee.userName.trim() || trainee.userEmail;
            return (
              <li
                key={String(trainee.id)}
                className="flex w-36 flex-col items-center gap-1.5 text-center"
              >
                <UserAvatar
                  avatarKey={trainee.avatarKey}
                  name={label}
                  className="size-12 shrink-0 border border-white/25"
                />
                <span className="inline-flex max-w-full items-center break-words rounded-full border border-or/30 bg-or/10 px-3 py-1 text-center text-sm font-medium leading-snug text-or-light">
                  {label}
                </span>
                <span className="text-sm tabular-nums text-muted-text">
                  {trainee.amountEuros != null
                    ? `${trainee.amountEuros.toLocaleString("fr-FR")} €`
                    : "—"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
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
      <p className="label-copy">
        {title}
      </p>
      {people.length === 0 ? (
        <p className="mt-1.5 text-sm text-muted-text">{emptyLabel}</p>
      ) : (
        <ul className="mt-2.5 flex flex-wrap gap-3">
          {people.map((p) => (
            <li key={String(p.id)} className="flex max-w-40 flex-col items-center gap-1.5">
              {p.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.photoUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-full border border-white/25 object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="inline-flex size-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-cream"
                >
                  {staffInitials(p.nom)}
                </span>
              )}
              <span className="inline-flex max-w-full items-center rounded-full border border-or/30 bg-or/10 px-3 py-1 text-center text-sm font-medium text-or-light">
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
        const pastel = pastelForFormationName(session.formationTitre);
        const canDelete = isAdminMode && enrolledCount === 0;
        const mailtoArgs = {
          formationTitre: session.formationTitre,
          sessionLabel,
        };
        const mailtoStagiaires = buildMailto({
          emails: traineeEmails(session.trainees),
          ...mailtoArgs,
        });
        const mailtoFormateurs = buildMailto({
          emails: staffEmails(session.formateurs),
          ...mailtoArgs,
        });
        const mailtoIntervenants = buildMailto({
          emails: staffEmails(session.intervenants),
          ...mailtoArgs,
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
              <div className="absolute -top-3 -right-3 z-30 flex items-center gap-2">
                <AdminEditButton
                  label={`Modifier ${session.formationTitre}`}
                  onClick={() => onEdit?.(session)}
                />
                <AdminDeleteButton
                  label={`Supprimer ${session.formationTitre}`}
                  disabled={!canDelete}
                  disabledReason="Impossible : au moins un élève est inscrit"
                  onClick={() => onDelete?.(session)}
                />
              </div>
            ) : null}

            <div
              className={cn(
                "formation-ink relative overflow-hidden rounded-2xl border border-border",
                "dark:!bg-[var(--session-empty-dark)]",
              )}
              style={
                {
                  backgroundColor: pastel.empty,
                  color: pastel.text,
                  ["--session-empty-dark"]: pastel.emptyDark,
                  ["--session-fill"]: pastel.fill,
                  ["--session-fill-dark"]: pastel.fillDark,
                  ["--tile-text"]: pastel.text,
                  ["--tile-text-dark"]: pastel.textDark,
                  ["--tile-muted"]: pastel.mutedDark,
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
                <div
                  className={cn(
                    "px-4 sm:px-5",
                    // Sous les boutons flottants admin ; sinon padding standard
                    isAdminMode ? "pt-10 sm:pt-11" : "pt-4 sm:pt-5",
                  )}
                >
                  <div className="flex w-full items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading text-xl leading-snug text-cream sm:text-2xl">
                          {session.formationTitre}
                        </p>
                        {full ? (
                          <SessionCompletBadge
                            tone="admin"
                            className="px-3.5 py-1.5 text-sm tracking-wide sm:px-4 sm:py-2"
                          />
                        ) : null}
                      </div>
                      {session.label && !isGeneratedSessionLabel(session.label) ? (
                        <p className="mt-1 text-sm text-or-light">
                          {session.label}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm leading-relaxed text-muted-text md:text-base">
                        <span className="block sm:inline">
                          {sessionLabel ?? "Session — dates à confirmer"}
                        </span>
                        <span className="hidden sm:inline">{" · "}</span>
                        <span className="mt-0.5 block sm:mt-0 sm:inline">
                          {enrolledCount} inscrit
                          {enrolledCount !== 1 ? "s" : ""}
                          {activeTraineeCount !== enrolledCount
                            ? ` · ${activeTraineeCount} au total`
                            : ""}
                          {" · "}
                          capacité {session.placesOffertes}
                          {fillPct > 0 ? ` · ${fillPct} %` : ""}
                          {!session.active ? " · fermée" : ""}
                        </span>
                      </p>
                    </div>

                    <AccordionTrigger
                      aria-label={
                        sessionLabel
                          ? `Ouvrir ou fermer ${session.formationTitre} — ${sessionLabel}`
                          : `Ouvrir ou fermer ${session.formationTitre}`
                      }
                      headerClassName="shrink-0"
                      className={cn(
                        "size-11 shrink-0 flex-none items-center justify-center p-0 hover:no-underline sm:size-12",
                        "rounded-xl border-0 focus-visible:ring-offset-0",
                        "**:data-[slot=accordion-trigger-icon]:hidden",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "btn-outline-warm inline-flex size-11 items-center justify-center rounded-xl sm:size-12",
                          "text-cream transition-colors",
                          "group-aria-expanded/accordion-trigger:border-or/45 group-aria-expanded/accordion-trigger:bg-or/15 group-aria-expanded/accordion-trigger:text-or-light",
                        )}
                      >
                        <ChevronDown className="size-5 group-aria-expanded/accordion-trigger:hidden sm:size-6" />
                        <ChevronUp className="hidden size-5 group-aria-expanded/accordion-trigger:inline sm:size-6" />
                      </span>
                    </AccordionTrigger>
                  </div>

                  <div className="mt-3 grid grid-cols-3 items-center gap-1.5 pb-4 sm:flex sm:flex-wrap sm:gap-2">
                    <SessionMailtoButton
                      href={mailtoStagiaires}
                      label="Envoyer un mail aux élèves"
                      shortLabel="Stagiaires"
                      disabledReason="Aucun élève inscrit avec un email"
                    />
                    <SessionMailtoButton
                      href={mailtoFormateurs}
                      label="Envoyer un mail aux formateurs"
                      shortLabel="Formateurs"
                      disabledReason="Aucun formateur avec un email sur cette session"
                    />
                    <SessionMailtoButton
                      href={mailtoIntervenants}
                      label="Envoyer un mail aux intervenants"
                      shortLabel="Intervenants"
                      disabledReason="Aucun intervenant avec un email sur cette session"
                    />
                  </div>
                </div>

                <AccordionContent className="border-t border-border/60 px-0 pb-0">
                  <div className="px-5 py-4">
                    <SessionStaffSection
                      title="Les intervenants pendant la session"
                      emptyLabel="Aucun intervenant"
                      people={session.intervenants}
                    />
                  </div>
                  <div className="border-t border-border/60 px-5 py-4">
                    <SessionStaffSection
                      title="Les formateurs lors de cette session"
                      emptyLabel="Aucun formateur"
                      people={session.formateurs}
                    />
                  </div>
                  <div className="border-t border-border/60 px-5 py-4">
                    <SessionElevesSection trainees={session.trainees} />
                  </div>

                  <div className="border-t border-border/60">
                    <div className="px-5 py-3">
                      <Link
                        href={formationPath(session.formationSlug)}
                        className="text-sm font-medium text-or-light underline-offset-2 hover:underline"
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
