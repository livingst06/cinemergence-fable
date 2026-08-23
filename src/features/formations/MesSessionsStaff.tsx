import Link from "next/link";

import { PageHero } from "@/components/sections/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import {
  FORMATION_TILE_CLASS,
  formationTileStyle,
} from "@/lib/formation-pastel";
import { formationPath } from "@/lib/formation-types";
import { formatFormationSessionLabel } from "@/lib/inscription-status";
import type { StaffKind, StaffSessionRow } from "@/lib/staff-sessions";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<StaffKind, string> = {
  formateur: "Formateur",
  intervenant: "Intervenant",
};

type MesSessionsStaffProps = {
  kind: StaffKind;
  sessions: StaffSessionRow[];
};

export function MesSessionsStaff({ kind, sessions }: MesSessionsStaffProps) {
  return (
    <>
      <PageHero
        eyebrow={kind === "formateur" ? "Espace formateur" : "Espace intervenant"}
        title="Mes sessions"
      />
      <Section>
        <div className="container-page max-w-3xl space-y-6">
          {sessions.length === 0 ? (
            <div className="card-stage space-y-4 p-8">
              <p className="text-sm text-muted-text">
                Aucune session pour le moment.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {sessions.map((row) => {
                const sessionLabel = formatFormationSessionLabel(
                  row.dateDebut,
                  row.dateFin,
                  { month: "long" },
                );
                return (
                  <li
                    key={row.id}
                    className={cn("card-stage p-6", FORMATION_TILE_CLASS)}
                    style={formationTileStyle(row.formationTitre)}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link
                          href={formationPath(row.formationSlug)}
                          className="font-heading text-2xl text-cream hover:text-or-light"
                        >
                          {row.formationTitre}
                        </Link>
                        {sessionLabel ? (
                          <p className="mt-1 text-sm text-muted-text">
                            {sessionLabel}
                          </p>
                        ) : null}
                      </div>
                      <span className="rounded-full border border-or/30 bg-or/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-or-light">
                        {KIND_LABEL[kind]}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <ButtonLink
                        href={formationPath(row.formationSlug)}
                        size="sm"
                        variant="outline"
                        className="btn-outline-warm"
                      >
                        Voir la fiche
                      </ButtonLink>
                      {row.salonId ? (
                        <ButtonLink
                          href={`/mes-sessions/salon/${row.salonId}`}
                          size="sm"
                          variant="outline"
                          className="btn-outline-warm"
                        >
                          Aller dans le salon de discussion
                        </ButtonLink>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Section>
    </>
  );
}
