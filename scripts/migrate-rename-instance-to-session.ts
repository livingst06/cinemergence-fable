/**
 * Renomme Postgres : formation_instances → formation_sessions,
 * inscriptions.instance_id → session_id (+ FKs / indexes).
 *
 * Usage: pnpm migrate:rename-sessions
 * À lancer AVANT de démarrer l’app avec le nouveau schéma Payload.
 */
import fs from "fs";
import path from "path";
import pg from "pg";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

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

async function main() {
  const c = new pg.Client({ connectionString: process.env.DATABASE_URI });
  await c.connect();

  try {
    await c.query("BEGIN");

    const hasOld = await tableExists(c, "formation_instances");
    const hasNew = await tableExists(c, "formation_sessions");

    if (!hasOld && hasNew) {
      console.log("= Déjà migré (formation_sessions existe).");
    } else if (!hasOld && !hasNew) {
      console.log("! Aucune table formation_instances / formation_sessions — Payload créera formation_sessions au prochain démarrage.");
    } else if (hasOld && hasNew) {
      throw new Error(
        "Les deux tables formation_instances et formation_sessions existent. Nettoyage manuel requis.",
      );
    } else {
      // Drop FKs pointing at formation_instances
      await c.query(
        `ALTER TABLE IF EXISTS inscriptions DROP CONSTRAINT IF EXISTS inscriptions_instance_id_formation_instances_id_fk`,
      );
      await c.query(
        `ALTER TABLE IF EXISTS payload_locked_documents_rels DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_formation_instances_fk`,
      );

      await c.query(`ALTER TABLE formation_instances RENAME TO formation_sessions`);
      console.log("+ Table formation_instances → formation_sessions");

      await c.query(
        `ALTER TABLE formation_sessions RENAME CONSTRAINT formation_instances_formation_id_formations_id_fk TO formation_sessions_formation_id_formations_id_fk`,
      ).catch(() => undefined);

      for (const [from, to] of [
        ["formation_instances_pkey", "formation_sessions_pkey"],
        ["formation_instances_formation_idx", "formation_sessions_formation_idx"],
        ["formation_instances_date_debut_idx", "formation_sessions_date_debut_idx"],
        ["formation_instances_updated_at_idx", "formation_sessions_updated_at_idx"],
        ["formation_instances_created_at_idx", "formation_sessions_created_at_idx"],
      ] as const) {
        await c
          .query(`ALTER INDEX IF EXISTS ${from} RENAME TO ${to}`)
          .catch(() => undefined);
      }
    }

    if (await columnExists(c, "inscriptions", "instance_id")) {
      await c.query(
        `ALTER TABLE inscriptions RENAME COLUMN instance_id TO session_id`,
      );
      console.log("+ Column inscriptions.instance_id → session_id");
      await c
        .query(
          `ALTER INDEX IF EXISTS inscriptions_instance_idx RENAME TO inscriptions_session_idx`,
        )
        .catch(() => undefined);
    } else if (await columnExists(c, "inscriptions", "session_id")) {
      console.log("= Column inscriptions.session_id déjà OK");
    }

    if (
      await columnExists(c, "payload_locked_documents_rels", "formation_instances_id")
    ) {
      await c.query(
        `ALTER TABLE payload_locked_documents_rels RENAME COLUMN formation_instances_id TO formation_sessions_id`,
      );
      console.log(
        "+ Column payload_locked_documents_rels.formation_instances_id → formation_sessions_id",
      );
      await c
        .query(
          `ALTER INDEX IF EXISTS payload_locked_documents_rels_formation_instances_id_idx RENAME TO payload_locked_documents_rels_formation_sessions_id_idx`,
        )
        .catch(() => undefined);
    }

    // Recreate FKs with new names
    if (await tableExists(c, "formation_sessions")) {
      if (await columnExists(c, "inscriptions", "session_id")) {
        await c.query(
          `ALTER TABLE inscriptions DROP CONSTRAINT IF EXISTS inscriptions_session_id_formation_sessions_id_fk`,
        );
        await c.query(
          `ALTER TABLE inscriptions
           ADD CONSTRAINT inscriptions_session_id_formation_sessions_id_fk
           FOREIGN KEY (session_id) REFERENCES formation_sessions(id)`,
        );
        console.log("+ FK inscriptions.session_id → formation_sessions");
      }

      if (
        await columnExists(
          c,
          "payload_locked_documents_rels",
          "formation_sessions_id",
        )
      ) {
        await c.query(
          `ALTER TABLE payload_locked_documents_rels DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_formation_sessions_fk`,
        );
        await c.query(
          `ALTER TABLE payload_locked_documents_rels
           ADD CONSTRAINT payload_locked_documents_rels_formation_sessions_fk
           FOREIGN KEY (formation_sessions_id) REFERENCES formation_sessions(id)`,
        );
        console.log("+ FK payload_locked_documents_rels.formation_sessions_id");
      }
    }

    await c.query("COMMIT");
    console.log("Done. Rename instance → session OK.");
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    await c.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
