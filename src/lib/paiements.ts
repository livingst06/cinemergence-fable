import { getPool, lockPublicTable } from "@/lib/db";
import { isKheironCheckout } from "@/lib/kheiron-checkout";
import { KHEIRON_ITEM_NAME } from "@/lib/kheiron-offer";
import { ensurePayerUser } from "@/lib/payer-user";

/** Session Kheiron du 28 novembre au 6 décembre 2026. */
const KHEIRON_SESSION_START = "2026-11-28";
const KHEIRON_SESSION_END = "2026-12-06";

export type Reglement = "une_fois" | "plusieurs_fois";

type PaymentMethod = {
  type?: string;
  billing_details?: { name?: string | null; email?: string | null; phone?: string | null } | null;
} | string | null;

type PaymentIntent = {
  id?: string;
  payment_method?: PaymentMethod;
} | string | null;

export type CheckoutForPaiement = {
  id?: string;
  created?: number;
  livemode?: boolean;
  status?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer_email?: string | null;
  client_reference_id?: string | null;
  metadata?: Record<string, string> | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  payment_intent?: PaymentIntent;
};

type SessionRow = {
  session_id: number;
  session_label: string | null;
  date_debut: Date;
  date_fin: Date;
  formation_id: number;
  formation_slug: string;
  formation_titre: string | null;
  inscription_id: number | null;
  user_id: number | null;
  user_email: string | null;
  user_name: string | null;
  amount_euros: number | null;
};

let tableReady: Promise<void> | null = null;

export function paymentMethodType(session: CheckoutForPaiement): string | null {
  const intent = session.payment_intent;
  if (!intent || typeof intent === "string") return null;
  const method = intent.payment_method;
  if (!method || typeof method === "string") return null;
  const type = method.type?.trim();
  return type || null;
}

export function billingName(session: CheckoutForPaiement): string | null {
  const intent = session.payment_intent;
  if (!intent || typeof intent === "string") return null;
  const method = intent.payment_method;
  if (!method || typeof method === "string") return null;
  const name = method.billing_details?.name?.trim();
  return name || null;
}

export function paymentIntentId(session: CheckoutForPaiement): string | null {
  const intent = session.payment_intent;
  if (!intent) return null;
  if (typeof intent === "string") return intent;
  return intent.id ?? null;
}

/** Carte : une fois. Klarna : le client paie en plusieurs fois. */
export function reglementOf(method: string | null): Reglement | null {
  if (!method) return null;
  if (method === "klarna") return "plusieurs_fois";
  return "une_fois";
}

export function isSuccessfulLivePayment(session: CheckoutForPaiement): boolean {
  return (
    session.livemode === true &&
    session.status === "complete" &&
    session.payment_status === "paid" &&
    typeof session.amount_total === "number" &&
    session.amount_total > 0
  );
}

async function ensureTable() {
  if (!tableReady) {
    tableReady = getPool()
      .query(`
        CREATE TABLE IF NOT EXISTS paiements (
          stripe_checkout_session_id text PRIMARY KEY,
          stripe_payment_intent_id text,
          paid_at timestamptz NOT NULL,
          amount_cents integer NOT NULL,
          currency text NOT NULL,
          payment_method text,
          reglement text,
          livemode boolean NOT NULL,
          payer_email text,
          payer_name text,
          payer_phone text,
          formation_id integer,
          formation_slug text NOT NULL,
          formation_titre text,
          session_id integer,
          session_label text,
          session_date_debut timestamptz,
          session_date_fin timestamptz,
          inscription_id integer,
          source text NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `)
      .then(() =>
        getPool().query(`
          ALTER TABLE paiements ADD COLUMN IF NOT EXISTS user_id integer;
          CREATE INDEX IF NOT EXISTS paiements_session_id_idx ON paiements (session_id);
          CREATE INDEX IF NOT EXISTS paiements_formation_slug_idx ON paiements (formation_slug);
          CREATE INDEX IF NOT EXISTS paiements_user_id_idx ON paiements (user_id);
          CREATE INDEX IF NOT EXISTS paiements_payer_email_idx ON paiements (payer_email);
        `),
      )
      .then(() => lockPublicTable("paiements"))
      .then(() => undefined)
      .catch((error) => {
        tableReady = null;
        throw error;
      });
  }
  await tableReady;
}

async function retrieveCheckout(sessionId: string): Promise<CheckoutForPaiement | null> {
  const key = process.env.CHOUKRI_STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("CHOUKRI_STRIPE_SECRET_KEY manquant");
  const params = new URLSearchParams();
  params.append("expand[]", "payment_intent.payment_method");
  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?${params}`,
    {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Stripe checkout session ${response.status}`);
  return (await response.json()) as CheckoutForPaiement;
}

async function contextFor(session: CheckoutForPaiement): Promise<SessionRow | null> {
  const pool = getPool();
  const inscriptionId = session.metadata?.inscriptionId || session.client_reference_id || "";
  if (/^\d+$/.test(inscriptionId)) {
    const found = await pool.query<SessionRow>(
      `SELECT s.id AS session_id,
              s.label AS session_label,
              s.date_debut,
              s.date_fin,
              f.id AS formation_id,
              f.slug AS formation_slug,
              f.titre AS formation_titre,
              i.id AS inscription_id,
              u.id AS user_id,
              u.email AS user_email,
              u.name AS user_name,
              i.amount_euros
       FROM inscriptions i
       LEFT JOIN users u ON u.id = i.user_id
       LEFT JOIN formation_sessions s ON s.id = i.session_id
       LEFT JOIN formations f ON f.id = COALESCE(s.formation_id, i.formation_id)
       WHERE i.id = $1`,
      [Number(inscriptionId)],
    );
    return found.rows[0] ?? null;
  }

  const sessionId = session.metadata?.sessionId;
  if (sessionId && /^\d+$/.test(sessionId)) {
    const found = await pool.query<SessionRow>(
      `SELECT s.id AS session_id,
              s.label AS session_label,
              s.date_debut,
              s.date_fin,
              f.id AS formation_id,
              f.slug AS formation_slug,
              f.titre AS formation_titre,
              NULL::integer AS inscription_id,
              NULL::integer AS user_id,
              NULL::text AS user_email,
              NULL::text AS user_name,
              NULL::numeric AS amount_euros
       FROM formation_sessions s
       JOIN formations f ON f.id = s.formation_id
       WHERE s.id = $1`,
      [Number(sessionId)],
    );
    return found.rows[0] ?? null;
  }

  if (!isKheironCheckout(session)) return null;
  const found = await pool.query<SessionRow>(
    `SELECT s.id AS session_id,
            s.label AS session_label,
            s.date_debut,
            s.date_fin,
            f.id AS formation_id,
            f.slug AS formation_slug,
            f.titre AS formation_titre,
            NULL::integer AS inscription_id,
            NULL::integer AS user_id,
            NULL::text AS user_email,
            NULL::text AS user_name,
            NULL::numeric AS amount_euros
     FROM formation_sessions s
     JOIN formations f ON f.id = s.formation_id
     WHERE f.slug = 'kheiron'
       AND s.date_debut::date = $1::date
       AND s.date_fin::date = $2::date
     ORDER BY s.id
     LIMIT 1`,
    [KHEIRON_SESSION_START, KHEIRON_SESSION_END],
  );
  return found.rows[0] ?? null;
}

/**
 * Enregistre un paiement Stripe déjà réussi. Un même checkout ne crée qu'une ligne.
 * Klarna (plusieurs fois) et carte (une fois) passent par le même webhook, une fois le paiement confirmé.
 */
export async function recordCheckoutPaiement(sessionId: string) {
  if (!sessionId) return { recorded: false as const, reason: "missing" };
  const session = await retrieveCheckout(sessionId);
  if (!session?.id || !isSuccessfulLivePayment(session)) {
    return { recorded: false as const, reason: "not_paid" };
  }

  const context = await contextFor(session);
  const slug =
    context?.formation_slug ||
    session.metadata?.formationSlug ||
    (isKheironCheckout(session) ? "kheiron" : "");
  if (!slug) return { recorded: false as const, reason: "unknown_formation" };

  const method = paymentMethodType(session);
  const email =
    session.customer_details?.email?.trim() ||
    session.customer_email?.trim() ||
    context?.user_email ||
    null;
  const name = session.customer_details?.name?.trim() || billingName(session) || context?.user_name || null;
  const phone = session.customer_details?.phone?.trim() || null;
  const amount =
    typeof session.amount_total === "number"
      ? session.amount_total
      : context?.amount_euros != null
        ? Math.round(Number(context.amount_euros) * 100)
        : null;
  if (amount == null || amount <= 0) return { recorded: false as const, reason: "no_amount" };

  const paidAt =
    typeof session.created === "number" ? new Date(session.created * 1000) : new Date();
  const metaUserId = session.metadata?.userId;
  const knownUserId =
    metaUserId && /^\d+$/.test(metaUserId) ? Number(metaUserId) : (context?.user_id ?? null);
  const userId = await ensurePayerUser({
    email,
    name,
    phone,
    userId: knownUserId,
  });
  const source = isKheironCheckout(session) ? "kheiron" : "catalogue";

  await ensureTable();
  await getPool().query(
    `INSERT INTO paiements (
       stripe_checkout_session_id, stripe_payment_intent_id, paid_at,
       amount_cents, currency, payment_method, reglement, livemode,
       payer_email, payer_name, payer_phone, user_id,
       formation_id, formation_slug, formation_titre,
       session_id, session_label, session_date_debut, session_date_fin,
       inscription_id, source
     ) VALUES (
       $1, $2, $3,
       $4, $5, $6, $7, $8,
       $9, $10, $11, $12,
       $13, $14, $15,
       $16, $17, $18, $19,
       $20, $21
     )
     ON CONFLICT (stripe_checkout_session_id) DO UPDATE SET
       stripe_payment_intent_id = COALESCE(EXCLUDED.stripe_payment_intent_id, paiements.stripe_payment_intent_id),
       payment_method = COALESCE(EXCLUDED.payment_method, paiements.payment_method),
       reglement = COALESCE(EXCLUDED.reglement, paiements.reglement),
       payer_email = COALESCE(EXCLUDED.payer_email, paiements.payer_email),
       payer_name = COALESCE(EXCLUDED.payer_name, paiements.payer_name),
       payer_phone = COALESCE(EXCLUDED.payer_phone, paiements.payer_phone),
       user_id = COALESCE(EXCLUDED.user_id, paiements.user_id),
       formation_id = COALESCE(EXCLUDED.formation_id, paiements.formation_id),
       formation_titre = COALESCE(EXCLUDED.formation_titre, paiements.formation_titre),
       session_id = COALESCE(EXCLUDED.session_id, paiements.session_id),
       session_label = COALESCE(EXCLUDED.session_label, paiements.session_label),
       session_date_debut = COALESCE(EXCLUDED.session_date_debut, paiements.session_date_debut),
       session_date_fin = COALESCE(EXCLUDED.session_date_fin, paiements.session_date_fin),
       inscription_id = COALESCE(EXCLUDED.inscription_id, paiements.inscription_id),
       updated_at = now()`,
    [
      session.id,
      paymentIntentId(session),
      paidAt,
      amount,
      (session.currency || "eur").toLowerCase(),
      method,
      reglementOf(method),
      session.livemode === true,
      email,
      name,
      phone,
      userId,
      context?.formation_id ?? null,
      slug,
      context?.formation_titre || (slug === "kheiron" ? KHEIRON_ITEM_NAME : null),
      context?.session_id ?? null,
      context?.session_label ?? null,
      context?.date_debut ?? (slug === "kheiron" ? KHEIRON_SESSION_START : null),
      context?.date_fin ?? (slug === "kheiron" ? KHEIRON_SESSION_END : null),
      context?.inscription_id ?? null,
      source,
    ],
  );
  return { recorded: true as const };
}

export type SessionPaiement = {
  checkoutSessionId: string;
  inscriptionId: number | null;
  userId: number | null;
  payerEmail: string | null;
  payerName: string | null;
  /** Nom du compte élève, s’il en a un. */
  eleveName: string | null;
  eleveAvatarKey: string | null;
  amountEuros: number;
  paidAt: string;
  formationSlug: string;
  formationTitre: string | null;
  sessionId: number | null;
  sessionLabel: string | null;
  sessionDateDebut: string | null;
  sessionDateFin: string | null;
};

export function paiementMatchesUser(
  paiement: Pick<SessionPaiement, "userId" | "payerEmail">,
  user: { userId?: number | string | null; email?: string | null },
): boolean {
  if (
    user.userId != null &&
    paiement.userId != null &&
    String(paiement.userId) === String(user.userId)
  ) {
    return true;
  }
  return samePayerEmail(paiement.payerEmail, user.email);
}

function samePayerEmail(left: string | null | undefined, right: string | null | undefined) {
  const a = left?.trim().toLowerCase();
  const b = right?.trim().toLowerCase();
  if (!a || !b || a === "—") return false;
  return a === b;
}

/** Paiements déjà encaissés qui ne correspondent pas à un verrou de place encore ouvert. */
export function paiementsSansInscription(
  paiements: SessionPaiement[],
  inscriptions: Array<{ id: number | string; email?: string | null }>,
): SessionPaiement[] {
  const ids = new Set(inscriptions.map((inscription) => String(inscription.id)));
  return paiements.filter((paiement) => {
    if (paiement.inscriptionId != null && ids.has(String(paiement.inscriptionId))) return false;
    return !inscriptions.some((inscription) =>
      samePayerEmail(inscription.email, paiement.payerEmail),
    );
  });
}

export async function listPaiementsForSessions(sessionIds: Array<number | string>) {
  const ids = [
    ...new Set(sessionIds.map((id) => Number(id)).filter((id) => Number.isInteger(id))),
  ];
  const bySession = new Map<string, SessionPaiement[]>();
  if (ids.length === 0) return bySession;

  await ensureTable();
  const result = await queryPaiementRows(
    "WHERE session_id = ANY($1::int[]) ORDER BY paid_at",
    [ids],
  );

  for (const row of result) {
    if (row.sessionId == null) continue;
    const key = String(row.sessionId);
    const list = bySession.get(key) ?? [];
    list.push(row);
    bySession.set(key, list);
  }
  return bySession;
}

export async function listAllPaiements() {
  await ensureTable();
  return queryPaiementRows("ORDER BY paid_at DESC", []);
}

export async function listPaiementsForPayer(user: {
  userId?: number | string | null;
  email?: string | null;
}) {
  const userId = user.userId != null && /^\d+$/.test(String(user.userId)) ? Number(user.userId) : null;
  const email = user.email?.trim().toLowerCase() || null;
  if (userId == null && !email) return [];
  await ensureTable();
  return queryPaiementRows(
    `WHERE ($1::int IS NOT NULL AND user_id = $1)
        OR ($2::text IS NOT NULL AND lower(payer_email) = $2)
     ORDER BY paid_at DESC`,
    [userId, email],
  );
}

function iso(value: Date | string | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function queryPaiementRows(suffix: string, params: unknown[]) {
  const result = await getPool().query<{
    stripe_checkout_session_id: string;
    inscription_id: number | null;
    user_id: number | null;
    payer_email: string | null;
    payer_name: string | null;
    eleve_name: string | null;
    eleve_avatar_key: string | null;
    amount_cents: number;
    paid_at: Date;
    formation_slug: string;
    formation_titre: string | null;
    session_id: number | null;
    session_label: string | null;
    session_date_debut: Date | null;
    session_date_fin: Date | null;
  }>(
    `SELECT p.stripe_checkout_session_id, p.inscription_id, p.user_id,
            p.payer_email, p.payer_name, p.amount_cents, p.paid_at,
            p.formation_slug, p.formation_titre, p.session_id, p.session_label,
            p.session_date_debut, p.session_date_fin,
            NULLIF(btrim(COALESCE(u.name, ue.name)), '') AS eleve_name,
            NULLIF(btrim(COALESCE(u.avatar_key, ue.avatar_key)), '') AS eleve_avatar_key
     FROM paiements p
     LEFT JOIN users u ON u.id = p.user_id
     LEFT JOIN users ue
       ON p.user_id IS NULL AND lower(ue.email) = lower(p.payer_email)
     ${suffix}`,
    params,
  );
  return result.rows.map(
    (row): SessionPaiement => ({
      checkoutSessionId: row.stripe_checkout_session_id,
      inscriptionId: row.inscription_id,
      userId: row.user_id,
      payerEmail: row.payer_email,
      payerName: row.payer_name,
      eleveName: row.eleve_name,
      eleveAvatarKey: row.eleve_avatar_key,
      amountEuros: Math.round(Number(row.amount_cents) / 100),
      paidAt: iso(row.paid_at) ?? new Date(0).toISOString(),
      formationSlug: row.formation_slug,
      formationTitre: row.formation_titre,
      sessionId: row.session_id,
      sessionLabel: row.session_label,
      sessionDateDebut: iso(row.session_date_debut),
      sessionDateFin: iso(row.session_date_fin),
    }),
  );
}

/** Rejoue les checkouts Kheiron déjà comptés, pour remplir la table la première fois. */
export async function backfillKheironPaiements() {
  await ensureTable();
  const existing = await getPool().query<{ session_id: string }>(
    "SELECT session_id FROM kheiron_payments ORDER BY created_at",
  );
  let recorded = 0;
  for (const row of existing.rows) {
    const result = await recordCheckoutPaiement(row.session_id);
    if (result.recorded) recorded += 1;
  }
  return { seen: existing.rows.length, recorded };
}
