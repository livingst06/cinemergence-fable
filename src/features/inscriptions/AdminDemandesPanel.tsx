"use client";

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
import type {
  AdminSessionGroup,
  AdminSessionStaff,
  AdminSessionTrainee,
} from "@/lib/admin-session-types";
import {
  FORMATION_TILE_CLASS,
  formationColorName,
  formationTileStyle,
} from "@/lib/formation-pastel";
import { formationPath } from "@/lib/formation-types";
import {
  formatEurosLabel,
  formatFormationSessionLabel,
  isGeneratedSessionLabel,
  normalizeInscriptionStatus,
} from "@/lib/inscription-status";
import {
  isSessionFull,
  sessionOccupancyRatio,
} from "@/lib/session-calendar";
import { cn } from "@/lib/utils";

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
          {enrolled.map((trainee, index) => {
            const label = trainee.userName.trim() || trainee.userEmail;
            const nameBlue =
              index % 2 === 0
                ? "border-[#2F5BFF]/45 bg-[#2F5BFF]/18 text-[#9DB4FF]"
                : "border-[#9EBEFF]/40 bg-[#6E92FF]/16 text-[#E4ECFF]";
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
                <span
                  className={cn(
                    "inline-flex max-w-full items-center break-words rounded-full border px-3 py-1 text-center text-sm font-medium leading-snug",
                    nameBlue,
                  )}
                >
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
  const rowGrid = cn(
    "grid w-full items-center gap-x-6 px-4 py-3 text-left",
    isAdminMode
      ? "grid-cols-[minmax(11rem,1.6fr)_minmax(10rem,1.3fr)_6rem_7rem_8.5rem_7.5rem_11rem_2.75rem]"
      : "grid-cols-[minmax(11rem,1.6fr)_minmax(10rem,1.3fr)_6rem_7rem_8.5rem_7.5rem_2.75rem]",
  );

  return (
    <div className="card-stage overflow-x-auto">
    <div className="min-w-[68rem]">
    <div className={cn(rowGrid, "border-b border-border text-sm font-semibold whitespace-nowrap text-muted-text")}>
      <span>Formation</span>
      <span>Session</span>
      <span>Inscrits</span>
      <span>Capacité</span>
      <span>Remplissage</span>
      <span>Encaissé</span>
      {isAdminMode ? <span className="sr-only">Actions</span> : null}
      <span className="sr-only">Ouvrir le détail</span>
    </div>
    <Accordion
      className="w-full"
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
        const collectedEuros = session.trainees
          .filter((trainee) => isEnrolled(trainee.status))
          .reduce((sum, trainee) => sum + (trainee.amountEuros ?? 0), 0);
        const full = isSessionFull(enrolledCount, session.placesOffertes);
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

        const sessionTitle =
          session.label && !isGeneratedSessionLabel(session.label)
            ? session.label
            : (sessionLabel ?? "Dates à confirmer");

        return (
          <AccordionItem
            key={value}
            value={value}
            id={value}
            className={cn(
              "relative border-0 border-b border-black/10 last:border-b-0",
              FORMATION_TILE_CLASS,
            )}
            style={formationTileStyle(
              formationColorName(session.formationTitre, session.formationSlug),
            )}
          >
            <div className="relative flex items-center">
              <AccordionTrigger
                aria-label={
                  sessionLabel
                    ? `Ouvrir ou fermer ${session.formationTitre} — ${sessionLabel}`
                    : `Ouvrir ou fermer ${session.formationTitre}`
                }
                headerClassName="min-w-0 flex-1"
                className={cn(
                  rowGrid,
                  "rounded-none border-0 py-3 hover:no-underline",
                  "focus-visible:ring-offset-0",
                  "**:data-[slot=accordion-trigger-icon]:hidden",
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium text-cream">{session.formationTitre}</span>
                  {full ? (
                    <SessionCompletBadge tone="admin" className="shrink-0 px-2 py-0.5 text-xs" />
                  ) : null}
                  {!session.active ? (
                    <span className="shrink-0 text-xs text-muted-text">Fermée</span>
                  ) : null}
                </span>
                <span className="truncate text-sm text-muted-text">{sessionTitle}</span>
                <span className="text-sm tabular-nums text-cream">
                  {enrolledCount}
                  {activeTraineeCount !== enrolledCount ? (
                    <span className="text-muted-text"> / {activeTraineeCount}</span>
                  ) : null}
                </span>
                <span className="text-sm tabular-nums text-muted-text">{session.placesOffertes}</span>
                <span className="text-sm tabular-nums text-cream">{fillPct} %</span>
                <span className="text-sm tabular-nums text-cream">{formatEurosLabel(collectedEuros)}</span>
                {isAdminMode ? <span aria-hidden /> : null}
                <span
                  aria-hidden
                  className="inline-flex size-9 items-center justify-center justify-self-end text-cream"
                >
                  <ChevronDown className="size-5 group-aria-expanded/accordion-trigger:hidden" />
                  <ChevronUp className="hidden size-5 group-aria-expanded/accordion-trigger:inline" />
                </span>
              </AccordionTrigger>
              {isAdminMode ? (
                <div className="absolute inset-y-0 right-[3.75rem] z-20 flex w-[11rem] items-center justify-end gap-2">
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
            </div>

            <AccordionContent className="border-t border-white/10 px-0 pb-0 [&_p]:mb-0">
              <div className="flex flex-wrap gap-2 px-4 py-4">
                <SessionMailtoButton
                  href={mailtoStagiaires}
                  label="Envoyer un mail aux élèves"
                  shortLabel="Élèves"
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
              <div className="border-t border-white/10 px-5 py-4">
                <SessionStaffSection
                  title="Les intervenants pendant la session"
                  emptyLabel="Aucun intervenant"
                  people={session.intervenants}
                />
              </div>
              <div className="border-t border-white/10 px-5 py-4">
                <SessionStaffSection
                  title="Les formateurs lors de cette session"
                  emptyLabel="Aucun formateur"
                  people={session.formateurs}
                />
              </div>
              <div className="border-t border-white/10 px-5 py-4">
                <SessionElevesSection trainees={session.trainees} />
              </div>
              <div className="border-t border-white/10 px-5 py-3">
                <Link
                  href={formationPath(session.formationSlug)}
                  className="text-sm font-medium text-or-light underline-offset-2 hover:underline"
                >
                  Voir la fiche formation
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
    </div>
    </div>
  );
}
