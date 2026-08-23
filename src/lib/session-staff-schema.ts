import type { Payload } from "payload";

async function columnExists(
  pool: { query: (sql: string, values?: unknown[]) => Promise<{ rows: Array<{ exists: boolean }> }> },
  table: string,
  column: string,
): Promise<boolean> {
  const result = await pool.query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
     ) AS exists`,
    [table, column],
  );
  return Boolean(result.rows[0]?.exists);
}

/**
 * Les formateurs / intervenants d’une session sont des `users`,
 * plus des fiches CMS Intervenants.
 */
export async function ensureSessionStaffUsersRels(
  payload: Payload,
): Promise<void> {
  const pool = payload.db.pool;
  if (!pool) return;

  await pool.query(`
    ALTER TABLE public.formation_sessions_rels
      ADD COLUMN IF NOT EXISTS users_id integer
  `);

  if (await columnExists(pool, "formation_sessions_rels", "intervenants_id")) {
    await pool.query(`
      DELETE FROM public.formation_sessions_rels
      WHERE path IN ('formateurs', 'intervenants')
        AND users_id IS NULL
        AND intervenants_id IS NOT NULL
    `);
    await pool.query(`
      ALTER TABLE public.formation_sessions_rels
        DROP CONSTRAINT IF EXISTS formation_sessions_rels_intervenants_fk
    `);
    await pool.query(`
      DROP INDEX IF EXISTS public.formation_sessions_rels_intervenants_id_idx
    `);
    await pool.query(`
      ALTER TABLE public.formation_sessions_rels
        DROP COLUMN IF EXISTS intervenants_id
    `);
  }

  await pool.query(`
    DO $$ BEGIN
      ALTER TABLE public.formation_sessions_rels
        ADD CONSTRAINT formation_sessions_rels_users_fk
        FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS formation_sessions_rels_users_id_idx
      ON public.formation_sessions_rels (users_id)
  `);

  if (await columnExists(pool, "intervenants", "visible_on_site")) {
    await pool.query(`
      ALTER TABLE public.intervenants
        DROP COLUMN IF EXISTS visible_on_site
    `);
  }
}
