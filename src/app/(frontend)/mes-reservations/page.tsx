import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageHero } from "@/components/sections/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { InscriptionStatusBadge } from "@/features/inscriptions/InscriptionStatusBadge";
import { ensurePayloadUserForClerk } from "@/lib/ensure-payload-user";
import { formationPath } from "@/lib/defaults";
import {
  formatFormationSessionLabel,
  normalizeInscriptionStatus,
} from "@/lib/inscription-status";
import { getPayloadClient } from "@/lib/payload";
import { getSessionProfile } from "@/lib/session-profile";
import { syncInscriptionIfStripePaid } from "@/lib/stripe-fulfillment";

export const metadata: Metadata = {
  title: "Mes réservations",
  robots: { index: false, follow: false },
};

type ReservationRow = {
  id: number | string;
  status: string;
  commentaireAdmin?: string | null;
  formationTitre: string;
  formationSlug: string;
  dateDebut?: string;
  dateFin?: string;
};

async function getMyReservations(
  payloadUserId: number | string,
): Promise<ReservationRow[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "inscriptions",
      where: { user: { equals: payloadUserId } },
      depth: 1,
      limit: 100,
      sort: "-updatedAt",
      overrideAccess: true,
    });

    // Filet : si Stripe a payé mais le webhook a manqué, on resynchronise
    await Promise.all(
      result.docs
        .filter((doc) => doc.status === "en_paiement" && doc.stripeCheckoutSessionId)
        .map((doc) =>
          syncInscriptionIfStripePaid(doc.id).catch((err) => {
            console.error("[mes-reservations] sync", doc.id, err);
            return false;
          }),
        ),
    );

    const refreshed = await payload.find({
      collection: "inscriptions",
      where: { user: { equals: payloadUserId } },
      depth: 2,
      limit: 100,
      sort: "-updatedAt",
      overrideAccess: true,
    });

    const rows: ReservationRow[] = [];
    for (const doc of refreshed.docs) {
      const formation = doc.formation;
      if (!formation || typeof formation !== "object") continue;
      const f = formation as {
        titre?: string;
        titreCourt?: string;
        slug?: string;
        dateDebut?: string;
        dateFin?: string;
      };
      if (!f.slug) continue;

      const instance =
        typeof doc.instance === "object" && doc.instance
          ? (doc.instance as {
              dateDebut?: string;
              dateFin?: string;
              label?: string | null;
            })
          : null;

      rows.push({
        id: doc.id,
        status: String(doc.status),
        commentaireAdmin: doc.commentaireAdmin
          ? String(doc.commentaireAdmin)
          : null,
        formationTitre: String(f.titre ?? f.titreCourt ?? f.slug),
        formationSlug: String(f.slug),
        dateDebut: instance?.dateDebut
          ? String(instance.dateDebut)
          : f.dateDebut
            ? String(f.dateDebut)
            : undefined,
        dateFin: instance?.dateFin
          ? String(instance.dateFin)
          : f.dateFin
            ? String(f.dateFin)
            : undefined,
      });
    }
    return rows;
  } catch {
    return [];
  }
}

export default async function MesReservationsPage() {
  const profile = await getSessionProfile();
  if (!profile.clerkUser) {
    redirect("/sign-in?redirect_url=/mes-reservations");
  }

  let payloadUserId = profile.payloadUserId;
  if (!payloadUserId) {
    const user = await ensurePayloadUserForClerk();
    payloadUserId = user?.id ?? null;
  }

  const rows = payloadUserId ? await getMyReservations(payloadUserId) : [];

  return (
    <>
      <PageHero eyebrow="Espace membre" title="Mes réservations" />
      <Section>
        <div className="container-page max-w-3xl space-y-6">
          {rows.length === 0 ? (
            <div className="card-stage space-y-4 p-8">
              <p className="text-sm text-muted-text">
                Aucune réservation pour le moment.
              </p>
              <ButtonLink href="/formations" className="btn-cta">
                Voir les formations
              </ButtonLink>
            </div>
          ) : (
            <ul className="space-y-4">
              {rows.map((row) => {
                const status = normalizeInscriptionStatus(row.status);
                const sessionLabel = formatFormationSessionLabel(
                  row.dateDebut,
                  row.dateFin,
                  { month: "long" },
                );
                return (
                  <li key={String(row.id)} className="card-stage p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link
                          href={formationPath(row.formationSlug)}
                          className="font-heading text-2xl text-cream hover:text-or-light"
                        >
                          {row.formationTitre}
                        </Link>
                        {sessionLabel && (
                          <p className="mt-1 text-sm text-muted-text">{sessionLabel}</p>
                        )}
                      </div>
                      <InscriptionStatusBadge status={row.status} />
                    </div>

                    {(status === "refusee" || status === "pieces_complementaires") &&
                    row.commentaireAdmin ? (
                      <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-50">
                        {row.commentaireAdmin}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {status === "en_paiement" ? (
                        <ButtonLink
                          href={`/paiement/${row.id}`}
                          size="sm"
                          className="btn-convert"
                        >
                          Finaliser le paiement
                        </ButtonLink>
                      ) : null}
                      <ButtonLink
                        href={formationPath(row.formationSlug)}
                        size="sm"
                        variant="outline"
                        className="btn-outline-warm"
                      >
                        Voir la fiche
                      </ButtonLink>
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
