import { getPool } from "@/lib/db";
import {
  formatFormationSessionLabel,
  isGeneratedSessionLabel,
} from "@/lib/inscription-status";
import { ensurePayerUser, normalizePayerEmail } from "@/lib/payer-user";

/** Session Kheiron du 28 novembre au 6 décembre 2026. */
const KHEIRON_SESSION_START = "2026-11-28";
const KHEIRON_SESSION_END = "2026-12-06";

export type HorsProcessPaiement = {
  id: number;
  payerName: string | null;
  payerEmail: string | null;
  amountEuros: number;
  paidAt: string;
  formationSlug: string;
  formationTitre: string | null;
  sessionId: number | null;
  sessionLabel: string | null;
  sessionDateDebut: string | null;
  sessionDateFin: string | null;
};

type HorsProcessRow = {
  id: number;
  payer_name: string | null;
  payer_email: string | null;
  amount_cents: number;
  paid_at: Date;
  formation_slug: string;
  formation_titre: string | null;
  session_id: number | null;
  session_label: string | null;
  session_date_debut: Date | null;
  session_date_fin: Date | null;
};

function iso(value: Date | string | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function mapRow(row: HorsProcessRow): HorsProcessPaiement {
  return {
    id: row.id,
    payerName: row.payer_name,
    payerEmail: row.payer_email,
    amountEuros: Math.round(Number(row.amount_cents) / 100),
    paidAt: iso(row.paid_at) ?? new Date(0).toISOString(),
    formationSlug: row.formation_slug,
    formationTitre: row.formation_titre,
    sessionId: row.session_id,
    sessionLabel: row.session_label,
    sessionDateDebut: iso(row.session_date_debut),
    sessionDateFin: iso(row.session_date_fin),
  };
}

async function findKheironSession() {
  const found = await getPool().query<{
    session_id: number;
    session_label: string | null;
    date_debut: Date;
    date_fin: Date;
    formation_id: number;
    formation_slug: string;
    formation_titre: string | null;
  }>(
    `SELECT s.id AS session_id,
            s.label AS session_label,
            s.date_debut,
            s.date_fin,
            f.id AS formation_id,
            f.slug AS formation_slug,
            f.titre AS formation_titre
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

const SELECT_ROWS = `SELECT id, payer_name, payer_email, amount_cents, paid_at,
            formation_slug, formation_titre, session_id, session_label,
            session_date_debut, session_date_fin
     FROM paiements_hors_process`;

export async function listHorsProcessForSessions(sessionIds: Array<number | string>) {
  const ids = [...new Set(sessionIds.map((id) => Number(id)).filter((id) => Number.isInteger(id)))];
  const bySession = new Map<string, HorsProcessPaiement[]>();
  if (ids.length === 0) return bySession;
  const result = await getPool().query<HorsProcessRow>(
    `${SELECT_ROWS} WHERE session_id = ANY($1::int[]) ORDER BY paid_at`,
    [ids],
  );
  for (const row of result.rows) {
    if (row.session_id == null) continue;
    const paiement = mapRow(row);
    const key = String(row.session_id);
    const list = bySession.get(key) ?? [];
    list.push(paiement);
    bySession.set(key, list);
  }
  return bySession;
}

export async function listAllHorsProcess() {
  const result = await getPool().query<HorsProcessRow>(`${SELECT_ROWS} ORDER BY paid_at DESC`);
  return result.rows.map(mapRow);
}

/** Places Kheiron payées hors Stripe, pour le compteur de la landing. */
export async function countKheironHorsProcess(): Promise<number> {
  const session = await findKheironSession();
  const result = session
    ? await getPool().query<{ n: number }>(
        `SELECT COUNT(*)::int AS n FROM paiements_hors_process WHERE session_id = $1`,
        [session.session_id],
      )
    : await getPool().query<{ n: number }>(
        `SELECT COUNT(*)::int AS n FROM paiements_hors_process WHERE formation_slug = 'kheiron'`,
      );
  return result.rows[0]?.n ?? 0;
}

export type HorsProcessSessionChoice = {
  id: number;
  formationTitre: string;
  formationSlug: string;
  sessionLabel: string;
};

export async function listHorsProcessSessionChoices(): Promise<HorsProcessSessionChoice[]> {
  const result = await getPool().query<{
    id: number;
    label: string | null;
    date_debut: Date;
    date_fin: Date;
    formation_slug: string;
    formation_titre: string | null;
  }>(
    `SELECT s.id, s.label, s.date_debut, s.date_fin, f.slug AS formation_slug, f.titre AS formation_titre
     FROM formation_sessions s
     JOIN formations f ON f.id = s.formation_id
     ORDER BY s.date_debut DESC, s.id DESC`,
  );
  return result.rows.map((row) => {
    const stored = row.label?.trim() || "";
    const formatted =
      formatFormationSessionLabel(iso(row.date_debut) ?? undefined, iso(row.date_fin) ?? undefined, {
        month: "short",
      }) ?? "Session";
    return {
      id: row.id,
      formationTitre: row.formation_titre?.trim() || row.formation_slug,
      formationSlug: row.formation_slug,
      sessionLabel: stored && !isGeneratedSessionLabel(stored) ? stored : formatted,
    };
  });
}

const PAID_AT_LOCAL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function horsProcessPaidAtLocal(value: string): string | null {
  const match = PAID_AT_LOCAL.exec(value.trim());
  if (!match) return null;
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;
  return `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:00`;
}

export async function insertHorsProcessPaiement(input: {
  payerName: string | null;
  payerEmail: string | null;
  amountCents: number;
  paidAtLocal: string;
  sessionId: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const paidAt = horsProcessPaidAtLocal(input.paidAtLocal);
  if (!paidAt) return { ok: false, error: "Date invalide." };
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    return { ok: false, error: "Montant invalide." };
  }
  if (!Number.isInteger(input.sessionId)) return { ok: false, error: "Session invalide." };

  const email = normalizePayerEmail(input.payerEmail);
  const name = input.payerName?.trim() || null;
  if (email) {
    await ensurePayerUser({ email, name }).catch((error) => {
      console.error("[paiements-hors-process] élève", error instanceof Error ? error.message : error);
    });
  }

  const inserted = await getPool().query(
    `INSERT INTO paiements_hors_process (
       paid_at, amount_cents, currency, payer_name, payer_email,
       formation_id, formation_slug, formation_titre,
       session_id, session_label, session_date_debut, session_date_fin
     )
     SELECT
       ($1::timestamp AT TIME ZONE 'Europe/Paris'),
       $2, 'eur', $3, $4,
       f.id, f.slug, f.titre,
       s.id, s.label, s.date_debut, s.date_fin
     FROM formation_sessions s
     JOIN formations f ON f.id = s.formation_id
     WHERE s.id = $5
     RETURNING id`,
    [paidAt, input.amountCents, name, email, input.sessionId],
  );
  if (inserted.rowCount !== 1) return { ok: false, error: "Session introuvable." };
  return { ok: true };
}

export async function deleteHorsProcessPaiement(id: number): Promise<boolean> {
  if (!Number.isInteger(id) || id <= 0) return false;
  const result = await getPool().query(`DELETE FROM paiements_hors_process WHERE id = $1`, [id]);
  return result.rowCount === 1;
}
