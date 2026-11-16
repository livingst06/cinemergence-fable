/**
 * Migre les statuts legacy inscriptions (demande→en_instruction, inscrit→validee).
 * Usage: NODE_OPTIONS='--require ./scripts/next-env-shim.cjs' tsx scripts/migrate-inscription-statuses.ts
 */
import fs from "fs";
import path from "path";

import { loadEnvConfig } from "@next/env";

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
Object.assign(process.env, {
  MEDIA_STORAGE: "supabase",
  NODE_ENV: "development",
});

async function main() {
  const { getPayloadClient } = await import("../src/lib/payload");
  const payload = await getPayloadClient();

  const map: Record<string, string> = {
    demande: "en_instruction",
    inscrit: "validee",
  };

  let updated = 0;
  for (const [from, to] of Object.entries(map)) {
    const found = await payload.find({
      collection: "inscriptions",
      where: { status: { equals: from } },
      limit: 200,
      depth: 0,
    });
    for (const doc of found.docs) {
      await payload.update({
        collection: "inscriptions",
        id: doc.id,
        data: { status: to },
        overrideAccess: true,
      });
      updated += 1;
    }
  }

  console.log(`✓ ${updated} inscription(s) migrée(s)`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
