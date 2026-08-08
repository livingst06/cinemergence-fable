/**
 * Renseigne placesOffertes (aléatoire) sur chaque formation CMS.
 * Usage: pnpm seed:places
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
loadEnvFile(path.resolve(".env.local"));
loadEnvFile(path.resolve(".env.vercel.production"));
Object.assign(process.env, {
  MEDIA_STORAGE: "supabase",
  NODE_ENV: "development",
});

function randomPlaces(): number {
  // Sessions typiques : 6 à 14 places
  return 6 + Math.floor(Math.random() * 9);
}

async function main() {
  const { getPayloadClient } = await import("../src/lib/payload");
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "formations",
    limit: 200,
    depth: 0,
    overrideAccess: true,
  });

  let updated = 0;
  for (const doc of result.docs) {
    const placesOffertes = randomPlaces();
    await payload.update({
      collection: "formations",
      id: doc.id,
      data: {
        placesOffertes,
        effectifMax: placesOffertes,
      },
      overrideAccess: true,
    });
    console.log(`· ${doc.slug}: ${placesOffertes} places`);
    updated += 1;
  }

  console.log(`✓ ${updated} formation(s) mise(s) à jour`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
