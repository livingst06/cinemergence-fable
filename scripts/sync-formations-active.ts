/** Add formations.active and set the public catalogue flags. */
import { loadEnvConfig } from "@next/env";
import pg from "pg";

import { PUBLIC_FORMATION_SLUGS } from "../src/lib/formation-types";

loadEnvConfig(process.cwd());

async function main() {
  const connectionString = process.env.DATABASE_URI;
  if (!connectionString) {
    throw new Error("DATABASE_URI manquant");
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    await client.query(`
      ALTER TABLE formations
      ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT false
    `);
    await client.query(`UPDATE formations SET active = (slug = ANY($1::text[]))`, [
      [...PUBLIC_FORMATION_SLUGS],
    ]);

    const { rows } = await client.query<{ slug: string; active: boolean }>(
      `SELECT slug, active FROM formations ORDER BY slug`,
    );
    const on = rows.filter((row) => row.active).map((row) => row.slug);
    const off = rows.filter((row) => !row.active).map((row) => row.slug);
    console.log(`✓ ${on.length} formation(s) active(s):`);
    for (const slug of on) console.log(`  · ${slug}`);
    console.log(`✓ ${off.length} formation(s) masquée(s):`);
    for (const slug of off) console.log(`  · ${slug}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
