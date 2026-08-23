import "server-only";

import type Stripe from "stripe";

import {
  formatFormationSessionLabel,
} from "@/lib/inscription-status";
import {
  resolvePaiementStatus,
  splitEleveName,
  type AdminPaiementRow,
  type PaiementStripeHint,
} from "@/lib/paiement-status";
import { getPayloadClient } from "@/lib/payload";
import { getStripe } from "@/lib/stripe";

const PAYMENT_LOCAL_STATUSES = ["en_paiement", "payee", "annule"] as const;
const MAX_STRIPE_PAGES = 5;

function stripeHint(session: Stripe.Checkout.Session): PaiementStripeHint {
  const intent = session.payment_intent;
  const intentObj =
    typeof intent === "object" && intent
      ? (intent as {
          status?: string;
          amount_refunded?: number;
        })
      : null;
  return {
    status: session.status,
    paymentStatus: session.payment_status,
    amountRefunded: intentObj?.amount_refunded ?? null,
    paymentIntentStatus: intentObj?.status ?? null,
  };
}

function amountFromStripe(session?: Stripe.Checkout.Session): number | null {
  if (!session) return null;
  if (typeof session.amount_total === "number" && session.amount_total > 0) {
    return Math.round(session.amount_total / 100);
  }
  return null;
}

async function listStripeCheckoutById(): Promise<
  Map<string, Stripe.Checkout.Session>
> {
  const byId = new Map<string, Stripe.Checkout.Session>();
  if (!process.env.STRIPE_SECRET_KEY?.trim()) return byId;

  try {
    const stripe = getStripe();
    let startingAfter: string | undefined;
    for (let page = 0; page < MAX_STRIPE_PAGES; page += 1) {
      const batch = await stripe.checkout.sessions.list({
        limit: 100,
        starting_after: startingAfter,
        expand: ["data.payment_intent"],
      });
      for (const session of batch.data) {
        byId.set(session.id, session);
      }
      if (!batch.has_more) break;
      const last = batch.data[batch.data.length - 1];
      if (!last) break;
      startingAfter = last.id;
    }
  } catch (error) {
    console.warn("[listAdminPaiements] stripe.list", error);
  }
  return byId;
}

type InscriptionPaymentDoc = {
  id: number | string;
  status?: string | null;
  stripeCheckoutSessionId?: string | null;
  amountEuros?: number | null;
  createdAt?: string;
  updatedAt?: string;
  user?: unknown;
  formation?: unknown;
  session?: unknown;
};

function isPaymentRelated(doc: InscriptionPaymentDoc): boolean {
  const status = String(doc.status ?? "");
  if ((PAYMENT_LOCAL_STATUSES as readonly string[]).includes(status)) return true;
  return Boolean(doc.stripeCheckoutSessionId);
}

/** Admin: tous les encaissements, fusionnés avec Stripe Checkout. */
export async function listAdminPaiements(): Promise<AdminPaiementRow[]> {
  try {
    const payload = await getPayloadClient();
    const [inscriptions, stripeById] = await Promise.all([
      payload.find({
        collection: "inscriptions",
        depth: 1,
        limit: 500,
        sort: "-createdAt",
        overrideAccess: true,
      }),
      listStripeCheckoutById(),
    ]);

    const rows: AdminPaiementRow[] = [];
    const seenStripeIds = new Set<string>();

    for (const raw of inscriptions.docs) {
      const doc = raw as InscriptionPaymentDoc;
      if (!isPaymentRelated(doc)) continue;

      const user =
        typeof doc.user === "object" && doc.user
          ? (doc.user as { email?: string; name?: string })
          : null;
      const formation =
        typeof doc.formation === "object" && doc.formation
          ? (doc.formation as { titre?: string; titreCourt?: string; slug?: string })
          : null;
      const sessionDoc =
        typeof doc.session === "object" && doc.session
          ? (doc.session as { dateDebut?: string; dateFin?: string })
          : null;

      const stripeId = doc.stripeCheckoutSessionId
        ? String(doc.stripeCheckoutSessionId)
        : null;
      const stripe = stripeId ? stripeById.get(stripeId) : undefined;
      if (stripeId) seenStripeIds.add(stripeId);

      const { prenom, nom } = splitEleveName(user?.name);
      const paidAt = stripe
        ? new Date(stripe.created * 1000).toISOString()
        : String(doc.createdAt ?? doc.updatedAt ?? new Date().toISOString());

      const amountEuros =
        amountFromStripe(stripe) ??
        (typeof doc.amountEuros === "number" ? doc.amountEuros : null);

      rows.push({
        id: `inscription-${doc.id}`,
        inscriptionId: String(doc.id),
        elevePrenom: prenom,
        eleveNom: nom,
        eleveEmail: String(user?.email ?? stripe?.customer_email ?? "—"),
        formationTitre: String(
          formation?.titre ?? formation?.titreCourt ?? formation?.slug ?? "Formation",
        ),
        formationSlug: formation?.slug ? String(formation.slug) : null,
        sessionLabel: formatFormationSessionLabel(
          sessionDoc?.dateDebut ? String(sessionDoc.dateDebut) : undefined,
          sessionDoc?.dateFin ? String(sessionDoc.dateFin) : undefined,
          { month: "long" },
        ),
        amountEuros,
        paidAt,
        status: resolvePaiementStatus({
          localStatus: String(doc.status ?? ""),
          stripe: stripe ? stripeHint(stripe) : null,
        }),
      });
    }

    for (const [stripeId, session] of stripeById) {
      if (seenStripeIds.has(stripeId)) continue;
      const email = session.customer_email ?? session.customer_details?.email ?? "—";
      const meta = session.metadata ?? {};
      rows.push({
        id: `stripe-${stripeId}`,
        inscriptionId: meta.inscriptionId ?? null,
        elevePrenom: "",
        eleveNom: "",
        eleveEmail: email || "—",
        formationTitre: meta.formationSlug
          ? String(meta.formationSlug)
          : "Paiement Stripe",
        formationSlug: meta.formationSlug ? String(meta.formationSlug) : null,
        sessionLabel: formatFormationSessionLabel(
          meta.dateDebut || undefined,
          meta.dateFin || undefined,
          { month: "long" },
        ),
        amountEuros: amountFromStripe(session),
        paidAt: new Date(session.created * 1000).toISOString(),
        status: resolvePaiementStatus({
          stripe: stripeHint(session),
        }),
      });
    }

    rows.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
    return rows;
  } catch (error) {
    console.error("[listAdminPaiements]", error);
    return [];
  }
}
