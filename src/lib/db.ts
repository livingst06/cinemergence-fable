import pg from "pg";

let pool: pg.Pool | null = null;

export function getPool() {
  const connectionString = process.env.DATABASE_URI;
  if (!connectionString) throw new Error("DATABASE_URI manquant");
  if (!pool) pool = new pg.Pool({ connectionString, max: 2 });
  return pool;
}
