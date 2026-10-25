import pg from "pg";

/** Les 5 premiers paiements confirmés : 1 290 €. */
const EARLY_PAYMENT_LINK = "https://buy.stripe.com/aFadR8fWP9H18Vr5Z2bwk09";
/** À partir du 6e, et aussi une fois la session complète : 1 490 €. */
const STANDARD_PAYMENT_LINK = "https://buy.stripe.com/3cI28q3a38CX5Jf9bebwk0b";

const EARLY_LIMIT = 5;
const CAPACITY = 20;

const SESSION_ID = /^cs_(live|test)_[A-Za-z0-9]{8,}$/;

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

/** Enregistre un retour Stripe réussi. Un même session_id ne compte qu'une fois. */
export async function recordKheironPayment(sessionId: string | undefined) {
  if (!sessionId || !SESSION_ID.test(sessionId)) return { counted: false };
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
