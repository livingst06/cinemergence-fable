/**
 * Crée les tables Postgres des salons + un salon par session existante.
 * Usage: pnpm seed:salons
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
loadEnvFile(path.resolve(".env.local"));
loadEnvFile(path.resolve(".env"));

async function tableExists(c: pg.Client, name: string) {
  const r = await c.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`,
    [name],
  );
  return (r.rowCount ?? 0) > 0;
}

async function columnExists(c: pg.Client, table: string, column: string) {
  const r = await c.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2`,
    [table, column],
  );
  return (r.rowCount ?? 0) > 0;
}

async function addRelsColumn(
  c: pg.Client,
  table: string,
  column: string,
  references: string,
) {
  if (!(await tableExists(c, table))) return;
  if (!(await columnExists(c, table, column))) {
    await c.query(
      `ALTER TABLE ${table} ADD COLUMN ${column} integer`,
    );
    console.log(`+ Colonne ${table}.${column}`);
  }
  await c.query(
    `CREATE INDEX IF NOT EXISTS ${table}_${column}_idx ON ${table} (${column})`,
  );
  const fk = `${table}_${column.replace(/_id$/, "")}_fk`;
  await c.query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${fk}`);
  await c.query(
    `ALTER TABLE ${table}
     ADD CONSTRAINT ${fk}
     FOREIGN KEY (${column}) REFERENCES ${references}(id) ON DELETE CASCADE`,
  );
}

async function enableRls(c: pg.Client, table: string) {
  await c.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
  await c.query(`REVOKE ALL ON TABLE ${table} FROM anon, authenticated`).catch(
    () => undefined,
  );
}

async function ensureTables(c: pg.Client) {
  if (!(await tableExists(c, "formation_sessions"))) {
    throw new Error("Table formation_sessions introuvable — migrate les sessions d’abord.");
  }
  if (!(await tableExists(c, "users"))) {
    throw new Error("Table users introuvable.");
  }

  await c.query(`
    CREATE TABLE IF NOT EXISTS session_salons (
      id serial PRIMARY KEY NOT NULL,
      session_id integer NOT NULL,
      updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
      created_at timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `);
  await c.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS session_salons_session_idx ON session_salons (session_id)`,
  );
  await c.query(
    `CREATE INDEX IF NOT EXISTS session_salons_updated_at_idx ON session_salons (updated_at)`,
  );
  await c.query(
    `CREATE INDEX IF NOT EXISTS session_salons_created_at_idx ON session_salons (created_at)`,
  );
  await c.query(
    `ALTER TABLE session_salons DROP CONSTRAINT IF EXISTS session_salons_session_id_formation_sessions_id_fk`,
  );
  await c.query(`
    ALTER TABLE session_salons
    ADD CONSTRAINT session_salons_session_id_formation_sessions_id_fk
    FOREIGN KEY (session_id) REFERENCES formation_sessions(id) ON DELETE SET NULL
  `);
  await enableRls(c, "session_salons");
  console.log("+ Table session_salons");

  await c.query(`
    CREATE TABLE IF NOT EXISTS salon_posts (
      id serial PRIMARY KEY NOT NULL,
      salon_id integer NOT NULL,
      author_id integer NOT NULL,
      body varchar NOT NULL,
      updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
      created_at timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `);
  await c.query(
    `CREATE INDEX IF NOT EXISTS salon_posts_salon_idx ON salon_posts (salon_id)`,
  );
  await c.query(
    `CREATE INDEX IF NOT EXISTS salon_posts_author_idx ON salon_posts (author_id)`,
  );
  await c.query(
    `CREATE INDEX IF NOT EXISTS salon_posts_updated_at_idx ON salon_posts (updated_at)`,
  );
  await c.query(
    `CREATE INDEX IF NOT EXISTS salon_posts_created_at_idx ON salon_posts (created_at)`,
  );
  await c.query(
    `ALTER TABLE salon_posts DROP CONSTRAINT IF EXISTS salon_posts_salon_id_session_salons_id_fk`,
  );
  await c.query(`
    ALTER TABLE salon_posts
    ADD CONSTRAINT salon_posts_salon_id_session_salons_id_fk
    FOREIGN KEY (salon_id) REFERENCES session_salons(id) ON DELETE SET NULL
  `);
  await c.query(
    `ALTER TABLE salon_posts DROP CONSTRAINT IF EXISTS salon_posts_author_id_users_id_fk`,
  );
  await c.query(`
    ALTER TABLE salon_posts
    ADD CONSTRAINT salon_posts_author_id_users_id_fk
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
  `);
  await enableRls(c, "salon_posts");
  console.log("+ Table salon_posts");

  await addRelsColumn(
    c,
    "payload_locked_documents_rels",
    "session_salons_id",
    "session_salons",
  );
  await addRelsColumn(
    c,
    "payload_locked_documents_rels",
    "salon_posts_id",
    "salon_posts",
  );
}

async function main() {
  const connectionString = process.env.DATABASE_URI;
  if (!connectionString) {
    throw new Error("DATABASE_URI manquant");
  }

  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? undefined
      : { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    await ensureTables(client);
  } finally {
    await client.end();
  }

  const { getPayloadClient } = await import("../src/lib/payload");
  const payload = await getPayloadClient();

  const sessions = await payload.find({
    collection: "formation-sessions",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });

  let created = 0;
  let existing = 0;
  for (const session of sessions.docs) {
    const found = await payload.find({
      collection: "session-salons",
      where: { session: { equals: session.id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    if (found.docs[0]) {
      existing += 1;
      continue;
    }
    await payload.create({
      collection: "session-salons",
      data: { session: session.id },
      overrideAccess: true,
    });
    created += 1;
  }

  console.log(
    `Done. ${sessions.totalDocs} sessions — ${created} salons créés, ${existing} déjà présents.`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
