import { getPool } from "@/lib/db";
import {
  isKheironPaymentAmount,
  KHEIRON_ITEM_ID,
  KHEIRON_PAYMENT_AMOUNTS,
  kheironOfferFromCount,
  type KheironOffer,
  type KheironOfferPhase,
} from "@/lib/kheiron-offer";

export { kheironOfferFromCount };
export type { KheironOffer, KheironOfferPhase };

const SESSION_ID = /^cs_(live|test)_[A-Za-z0-9]{8,}$/;

type StripeCheckoutSession = {
  mode?: string;
  status?: string;
  payment_status?: string;
  currency?: string | null;
  amount_total?: number | null;
  payment_link?: string | { id?: string } | null;
  livemode?: boolean;
  metadata?: { offer?: string } | null;
};

export function kheironPaymentLinkId(
  session: Pick<StripeCheckoutSession, "payment_link">,
): string | undefined {
  const link = session.payment_link;
  if (!link) return undefined;
  return typeof link === "string" ? link : link.id;
}

/** Lien de paiement Kheiron, ou session créée par /api/checkout pour cette offre. */
export function isKheironCheckout(session: StripeCheckoutSession): boolean {
  const link = kheironPaymentLinkId(session);
  if (link) return Object.prototype.hasOwnProperty.call(KHEIRON_PAYMENT_AMOUNTS, link);
  return session.metadata?.offer === KHEIRON_ITEM_ID;
}

export function isPaidKheironSession(session: StripeCheckoutSession): boolean {
  if (
    session.livemode !== true ||
    session.mode !== "payment" ||
    session.status !== "complete" ||
    session.payment_status !== "paid" ||
    session.currency !== "eur"
  ) {
    return false;
  }
  const link = kheironPaymentLinkId(session);
  if (link) return isKheironPaymentAmount(link, session.amount_total);
  return (
    session.metadata?.offer === KHEIRON_ITEM_ID &&
    session.amount_total != null &&
    session.amount_total > 0
  );
}

let tableReady: Promise<void> | null = null;

async function ensureTable() {
  if (!tableReady) {
    tableReady = getPool()
      .query(`
        CREATE TABLE IF NOT EXISTS kheiron_payments (
          session_id text PRIMARY KEY,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `)
      .then(() => undefined)
      .catch((error) => {
        tableReady = null;
        throw error;
      });
  }
  await tableReady;
}

export async function getKheironOffer(): Promise<KheironOffer> {
  await ensureTable();
  const result = await getPool().query<{ paid: number }>(
    "SELECT COUNT(*)::int AS paid FROM kheiron_payments",
  );
  return kheironOfferFromCount(result.rows[0]?.paid ?? 0);
}

async function retrieveKheironCheckoutSession(sessionId: string): Promise<StripeCheckoutSession | null> {
  const key = process.env.STRIPE_KHEIRON_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_KHEIRON_SECRET_KEY manquant");
  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Stripe checkout session ${response.status}`);
  return (await response.json()) as StripeCheckoutSession;
}

/**
 * Enregistre un paiement Stripe confirmé. Un même session_id ne compte qu'une fois.
 * Appelé par le webhook : la page de remerciement ne décide pas du compteur.
 */
export async function recordKheironPayment(sessionId: string | undefined) {
  if (!sessionId || !SESSION_ID.test(sessionId)) return { counted: false, already: false };
  const session = await retrieveKheironCheckoutSession(sessionId);
  if (!session || !isPaidKheironSession(session)) return { counted: false, already: false };
  await ensureTable();
  const inserted = await getPool().query(
    `INSERT INTO kheiron_payments (session_id)
     VALUES ($1)
     ON CONFLICT (session_id) DO NOTHING
     RETURNING session_id`,
    [sessionId],
  );
  if (inserted.rowCount === 1) return { counted: true, already: false };
  return { counted: false, already: true };
}
