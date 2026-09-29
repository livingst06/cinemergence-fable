/**
 * Apply RLS hardening on Supabase Postgres (Payload CMS tables).
 * Usage: pnpm supabase:rls
 */
import fs from "fs";
import path from "path";

import { loadEnvConfig } from "@next/env";
import pg from "pg";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    process.env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
}

loadEnvConfig(process.cwd());
loadEnvFile(path.resolve(".env.vercel.production"));

async function main() {
  const connectionString = process.env.DATABASE_URI;
  if (!connectionString) {
    throw new Error("DATABASE_URI manquant (.env.vercel.production)");
  }

  const sqlPath = path.resolve("scripts/supabase-enable-rls.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    await client.query(sql);

    const { rows } = await client.query<{
      tablename: string;
      rls_enabled: boolean;
      owner: string;
    }>(`
      SELECT c.relname AS tablename,
             c.relrowsecurity AS rls_enabled,
             pg_catalog.pg_get_userbyid(c.relowner) AS owner
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND NOT EXISTS (
          SELECT 1 FROM pg_depend d
          WHERE d.objid = c.oid AND d.deptype = 'e'
        )
      ORDER BY c.relname
    `);

    const disabled = rows.filter(
      (row) => row.owner === "postgres" && !row.rls_enabled,
    );
    if (disabled.length > 0) {
      console.error("Tables sans RLS:", disabled.map((row) => row.tablename).join(", "));
      process.exit(1);
    }

    const enabled = rows.filter((row) => row.rls_enabled);
    console.log(`✓ RLS activé sur ${enabled.length} tables public.`);
    for (const row of enabled) {
      console.log(`  · ${row.tablename}`);
    }
    const skipped = rows.filter((row) => row.owner !== "postgres");
    if (skipped.length > 0) {
      console.log(
        `(ignorées, hors postgres: ${skipped.map((r) => r.tablename).join(", ")})`,
      );
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
