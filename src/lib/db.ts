import pg from "pg";

let pool: pg.Pool | null = null;

export function getPool() {
  const connectionString = process.env.DATABASE_URI;
  if (!connectionString) throw new Error("DATABASE_URI manquant");
  if (!pool) pool = new pg.Pool({ connectionString, max: 2 });
  return pool;
}

/** Ferme une table du schéma public à l'API Supabase (anon / authenticated). */
export async function lockPublicTable(table: string) {
  if (!/^[a-z_][a-z0-9_]*$/.test(table)) {
    throw new Error(`Nom de table invalide: ${table}`);
  }
  await getPool().query(
    `DO $$
     BEGIN
       EXECUTE 'ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY';
       IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
         EXECUTE 'REVOKE ALL ON TABLE public.${table} FROM anon';
       END IF;
       IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
         EXECUTE 'REVOKE ALL ON TABLE public.${table} FROM authenticated';
       END IF;
     END $$`,
  );
}
