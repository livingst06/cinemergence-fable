import { getPool } from "@/lib/db";

export const MEASUREMENT_PURCHASE_URL = "https://wisdom.cinemergence.fr/v1/purchase";

let tableReady: Promise<void> | null = null;

async function ensureTable() {
  if (!tableReady) {
    tableReady = getPool()
      .query(`
        CREATE TABLE IF NOT EXISTS measurement_deliveries (
          session_id text PRIMARY KEY,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          attempts integer NOT NULL DEFAULT 0,
          last_status integer,
          payload jsonb,
          sent_at timestamptz
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
  await ensureTable();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [sessionId]);
    const claimed = await client.query<{ session_id: string }>(
      `INSERT INTO measurement_deliveries (session_id, payload, attempts, updated_at)
       VALUES ($1, $2::jsonb, 1, now())
       ON CONFLICT (session_id) DO UPDATE
       SET attempts = measurement_deliveries.attempts + 1,
           payload = EXCLUDED.payload,
           updated_at = now()
       WHERE measurement_deliveries.sent_at IS NULL
       RETURNING session_id`,
      [sessionId, JSON.stringify(payload)],
    );
    if (claimed.rowCount === 0) {
      await client.query("COMMIT");
      return { sent: false, duplicate: true as const, status: null };
    }

    let status: number | null = null;
    try {
      status = await postPurchase(payload);
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
  await ensureTable();
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
       AND created_at > now() - interval '48 hours'
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
