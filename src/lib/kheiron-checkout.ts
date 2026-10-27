import pg from "pg";

/** Les 5 premiers paiements confirmés : 1 290 €. */
const EARLY_PAYMENT_LINK = "https://buy.stripe.com/aFadR8fWP9H18Vr5Z2bwk09";
/** À partir du 6e, et aussi une fois la session complète : 1 490 €. */
const STANDARD_PAYMENT_LINK = "https://buy.stripe.com/3cI28q3a38CX5Jf9bebwk0b";

const EARLY_LIMIT = 5;
const CAPACITY = 20;

const SESSION_ID = /^cs_(live|test)_[A-Za-z0-9]{8,}$/;

/** Liens du compte Stripe qui encaisse la masterclass, avec leur montant en centimes. */
const KHEIRON_PAYMENT_LINKS: Record<string, number> = {
  plink_1UTe7yCXL04XIOiV6iAxpnwA: 129_000,
  plink_1UU3ceCXL04XIOiVTvg1tidi: 149_000,
};

type StripeCheckoutSession = {
  mode?: string;
  status?: string;
  payment_status?: string;
  currency?: string;
  amount_total?: number | null;
  payment_link?: string | { id?: string } | null;
  livemode?: boolean;
};

export function isPaidKheironSession(session: StripeCheckoutSession): boolean {
  const link =
    typeof session.payment_link === "string" ? session.payment_link : session.payment_link?.id;
  if (!link) return false;
  const expectedAmount = KHEIRON_PAYMENT_LINKS[link];
  return (
    session.livemode === true &&
    session.mode === "payment" &&
    session.status === "complete" &&
    session.payment_status === "paid" &&
    session.currency === "eur" &&
    expectedAmount !== undefined &&
    session.amount_total === expectedAmount
  );
}

export type KheironOfferPhase = "early" | "standard" | "full";

export type KheironOffer = {
  paidCount: number;
  seatsLeft: number;
  phase: KheironOfferPhase;
  paymentLink: string;
};

let pool: pg.Pool | null = null;
let tableReady: Promise<void> | null = null;

function getPool() {
  const connectionString = process.env.DATABASE_URI;
  if (!connectionString) throw new Error("DATABASE_URI manquant");
  if (!pool) pool = new pg.Pool({ connectionString, max: 2 });
  return pool;
}

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

export function kheironOfferFromCount(paidCount: number): KheironOffer {
  const seatsLeft = Math.max(0, CAPACITY - paidCount);
  if (paidCount >= CAPACITY) {
    return { paidCount, seatsLeft, phase: "full", paymentLink: STANDARD_PAYMENT_LINK };
  }
  if (paidCount >= EARLY_LIMIT) {
    return { paidCount, seatsLeft, phase: "standard", paymentLink: STANDARD_PAYMENT_LINK };
  }
  return { paidCount, seatsLeft, phase: "early", paymentLink: EARLY_PAYMENT_LINK };
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

/** Enregistre un paiement Stripe confirmé. Un même session_id ne compte qu'une fois. */
export async function recordKheironPayment(sessionId: string | undefined) {
  if (!sessionId || !SESSION_ID.test(sessionId)) return { counted: false };
  const session = await retrieveKheironCheckoutSession(sessionId);
  if (!session || !isPaidKheironSession(session)) return { counted: false };
  await ensureTable();
  const inserted = await getPool().query(
    `INSERT INTO kheiron_payments (session_id)
     VALUES ($1)
     ON CONFLICT (session_id) DO NOTHING
     RETURNING session_id`,
    [sessionId],
  );
  return { counted: inserted.rowCount === 1 };
}
