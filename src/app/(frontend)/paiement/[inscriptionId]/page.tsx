import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { StripeEmbeddedCheckout } from "@/features/inscriptions/StripeEmbeddedCheckout";
import { resumeCheckoutClientSecret } from "@/features/inscriptions/checkout-actions";
import { ensurePayloadUserForClerk } from "@/lib/ensure-payload-user";
import {
  formatEurosLabel,
  formatFormationSessionLabel,
} from "@/lib/inscription-status";
import { formationPath } from "@/lib/formation-types";
import { findInscriptionById } from "@/lib/inscriptions-query";
import { releaseExpiredHolds } from "@/lib/places";
import { getSessionProfile } from "@/lib/session-profile";
import { syncInscriptionIfStripePaid } from "@/lib/stripe-fulfillment";

type Props = { params: Promise<{ inscriptionId: string }> };

export const metadata: Metadata = {
  title: "Paiement",
  robots: { index: false, follow: false },
};

export default async function PaiementPage({ params }: Props) {
  const { inscriptionId } = await params;
  const session = await getSessionProfile();
  if (!session.clerkUser) {
    redirect(
      `/sign-in?redirect_url=${encodeURIComponent(`/paiement/${inscriptionId}`)}`,
    );
  }

  await releaseExpiredHolds();

  const user = await ensurePayloadUserForClerk();
  if (!user) {
    redirect(
      `/sign-in?redirect_url=${encodeURIComponent(`/paiement/${inscriptionId}`)}`,
    );
  }

  let doc;
  try {
    doc = await findInscriptionById(inscriptionId);
  } catch {
    notFound();
  }

  const ownerId =
    typeof doc.user === "object" && doc.user
      ? String((doc.user as { id: number | string }).id)
      : String(doc.user);
  if (ownerId !== String(user.id)) {
    notFound();
  }

  if (doc.status === "payee" || doc.status === "validee") {
    redirect("/paiement/succes");
  }

  if (doc.status === "en_paiement") {
    const synced = await syncInscriptionIfStripePaid(inscriptionId).catch(() => false);
    if (synced) redirect("/paiement/succes");
  }

  if (doc.status !== "en_paiement") {
    return (
      <div className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-lg space-y-6 text-center">
          <h1 className="section-title text-cream">Paiement indisponible</h1>
          <p className="text-muted-text">
            Cette réservation n’est plus en attente de paiement (expirée ou
            annulée).
          </p>
          <ButtonLink href="/formations" className="btn-cta">
            Voir les formations
          </ButtonLink>
        </div>
      </div>
    );
  }

  const expires = doc.holdExpiresAt ? new Date(String(doc.holdExpiresAt)) : null;
  // Hold window is wall-clock — intentional for checkout UX.
  // eslint-disable-next-line react-hooks/purity -- server page hold expiry check
  const nowMs = Date.now();
  if (!expires || expires.getTime() <= nowMs) {
    return (
      <div className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-lg space-y-6 text-center">
          <h1 className="section-title text-cream">Réservation expirée</h1>
          <p className="text-muted-text">
            Ta place réservée temporairement a été libérée. Tu peux réessayer
            depuis la fiche formation.
          </p>
          <ButtonLink href="/formations" className="btn-convert">
            Retour aux formations
          </ButtonLink>
        </div>
      </div>
    );
  }

  const resumed = await resumeCheckoutClientSecret(inscriptionId);
  if (!resumed.ok) {
    return (
      <div className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-lg space-y-6 text-center">
          <h1 className="section-title text-cream">Paiement indisponible</h1>
          <p className="text-muted-text">{resumed.error}</p>
          <ButtonLink href="/formations" className="btn-cta">
            Voir les formations
          </ButtonLink>
        </div>
      </div>
    );
  }

  const formation =
    typeof doc.formation === "object" && doc.formation
      ? (doc.formation as {
          titre?: string;
          slug?: string;
          dateDebut?: string;
          dateFin?: string;
        })
      : null;

  const sessionDoc =
    typeof doc.session === "object" && doc.session
      ? (doc.session as { dateDebut?: string; dateFin?: string })
      : null;

  const amountEuros =
    typeof doc.amountEuros === "number" ? doc.amountEuros : null;
  const sessionLabel = formatFormationSessionLabel(
    sessionDoc?.dateDebut
      ? String(sessionDoc.dateDebut)
      : formation?.dateDebut
        ? String(formation.dateDebut)
        : undefined,
    sessionDoc?.dateFin
      ? String(sessionDoc.dateFin)
      : formation?.dateFin
        ? String(formation.dateFin)
        : undefined,
    { month: "long" },
  );
  const minutesLeft = Math.max(
    1,
    Math.ceil((expires.getTime() - nowMs) / 60_000),
  );

  return (
    <div className="container-page py-10 md:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-xl space-y-8">
        <header className="space-y-3 text-center sm:text-left">
          <p className="eyebrow justify-center sm:justify-start">Paiement sécurisé</p>
          <h1 className="section-title text-cream">
            {formation?.titre ?? "Ta place de formation"}
          </h1>
          {sessionLabel ? (
            <p className="text-sm text-muted-text md:text-base">{sessionLabel}</p>
          ) : null}
          {amountEuros != null ? (
            <p className="font-heading text-3xl text-cream md:text-4xl">
              {formatEurosLabel(amountEuros)}
            </p>
          ) : null}
          <p className="text-xs text-muted-text">
            Place réservée {minutesLeft} min — au-delà, elle sera libérée
            automatiquement.
          </p>
        </header>

        <StripeEmbeddedCheckout clientSecret={resumed.clientSecret} />

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink
            href={
              formation?.slug
                ? formationPath(String(formation.slug))
                : "/formations"
            }
            size="lg"
            className="btn-cta w-full justify-center px-6 py-3 sm:w-auto sm:min-w-[14rem]"
          >
            Retour à la formation
          </ButtonLink>
          <ButtonLink
            href={`/paiement/annulation?inscriptionId=${encodeURIComponent(inscriptionId)}`}
            size="lg"
            className="btn-outline-warm w-full justify-center rounded-lg px-6 py-3 text-sm font-semibold uppercase tracking-wider sm:w-auto sm:min-w-[14rem]"
          >
            Annuler et libérer ma place
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
