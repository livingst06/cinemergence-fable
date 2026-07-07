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

    const { rows } = await client.query<{ tablename: string; rls_enabled: boolean }>(`
      SELECT c.relname AS tablename, c.relrowsecurity AS rls_enabled
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND (
          c.relname LIKE 'payload_%'
          OR c.relname LIKE 'formations%'
          OR c.relname LIKE 'intervenants%'
          OR c.relname IN (
            'users', 'users_sessions', 'media', 'temoignages',
            'form_submissions', 'site_settings', 'legal_pages'
          )
        )
      ORDER BY c.relname
    `);

    const disabled = rows.filter((row) => !row.rls_enabled);
    if (disabled.length > 0) {
      console.error("Tables sans RLS:", disabled.map((row) => row.tablename).join(", "));
      process.exit(1);
    }

    console.log(`✓ RLS activé sur ${rows.length} tables Payload.`);
    for (const row of rows) {
      console.log(`  · ${row.tablename}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
