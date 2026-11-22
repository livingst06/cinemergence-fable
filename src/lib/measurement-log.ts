import { getPool } from "@/lib/db";

export const MEASUREMENT_PURCHASE_URL = "https://wisdom.cinemergence.fr/v1/purchase";

async function postPurchase(payload: unknown): Promise<number> {
  const key = process.env.CINEMERGENCE_MEASUREMENT_KEY?.trim();
  if (!key) throw new Error("CINEMERGENCE_MEASUREMENT_KEY manquant");
  const response = await fetch(MEASUREMENT_PURCHASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Cinemergence-Key": key,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(3_000),
  });
  return response.status;
}

/**
 * Un envoi réussi par session. Un échec reste dans le journal pour la relance.
 * Le verrou tient pendant l'appel réseau (3 s max) pour qu'un webhook rejoué n'envoie pas deux fois.
 */
export async function deliverPurchase(sessionId: string, payload: Record<string, unknown>) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [sessionId]);
    const claimed = await client.query<{ session_id: string; payload: Record<string, unknown> }>(
      `INSERT INTO measurement_deliveries (session_id, payload, attempts, updated_at)
       VALUES ($1, $2::jsonb, 1, now())
       ON CONFLICT (session_id) DO UPDATE
       SET attempts = measurement_deliveries.attempts + 1,
           updated_at = now()
       WHERE measurement_deliveries.sent_at IS NULL
       RETURNING session_id, payload`,
      [sessionId, JSON.stringify(payload)],
    );
    if (claimed.rowCount === 0) {
      await client.query("COMMIT");
      return { sent: false, duplicate: true as const, status: null };
    }

    const stored = claimed.rows[0]?.payload ?? payload;
    let status: number | null = null;
    try {
      status = await postPurchase(stored);
    } catch (error) {
      console.error("[measurement]", sessionId, error instanceof Error ? error.message : "envoi échoué");
      status = null;
    }
    const sent = status != null && status >= 200 && status < 300;
    await client.query(
      `UPDATE measurement_deliveries
       SET last_status = $2,
           sent_at = CASE WHEN $3 THEN now() ELSE NULL END,
           updated_at = now()
       WHERE session_id = $1`,
      [sessionId, status, sent],
    );
    await client.query("COMMIT");
    return { sent, duplicate: false as const, status };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function retryMeasurementDeliveries() {
  const pool = getPool();
  const purged = await pool.query(
    `UPDATE measurement_deliveries
     SET payload = NULL, updated_at = now()
     WHERE sent_at IS NOT NULL
       AND sent_at < now() - interval '90 days'
       AND payload IS NOT NULL`,
  );
  const pending = await pool.query<{ session_id: string; payload: Record<string, unknown> }>(
    `SELECT session_id, payload
     FROM measurement_deliveries
     WHERE sent_at IS NULL
       AND payload IS NOT NULL
       AND created_at > now() - interval '3 days'
     ORDER BY created_at
     LIMIT 50`,
  );
  let sent = 0;
  for (const row of pending.rows) {
    try {
      const result = await deliverPurchase(row.session_id, row.payload);
      if (result.sent) sent += 1;
    } catch (error) {
      console.error("[measurement-retry]", row.session_id, error instanceof Error ? error.message : error);
    }
  }
  return { purged: purged.rowCount ?? 0, pending: pending.rows.length, sent };
}
