/**
 * Renseigne dateDebut / dateFin aléatoires sur chaque formation CMS.
 * - dateDebut ∈ ]2026-08-15, 2026-12-12[
 * - dateFin = dateDebut + n jours, n ∈ [2, 9]
 * Usage: pnpm seed:dates
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

const START_MIN = Date.UTC(2026, 7, 16); // 16 août 2026 (> 15 août)
const START_MAX = Date.UTC(2026, 11, 11); // 11 déc 2026 (< 12 déc)

function toIsoDate(utcMs: number): string {
  return new Date(utcMs).toISOString().slice(0, 10);
}

function randomSessionDates(): { dateDebut: string; dateFin: string } {
  const span = START_MAX - START_MIN;
  const startMs = START_MIN + Math.floor(Math.random() * (span + 1));
  const durationDays = 2 + Math.floor(Math.random() * 8); // 2..9
  const endMs = startMs + durationDays * 24 * 60 * 60 * 1000;
  return {
    dateDebut: toIsoDate(startMs),
    dateFin: toIsoDate(endMs),
  };
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
    const { dateDebut, dateFin } = randomSessionDates();
    await payload.update({
      collection: "formations",
      id: doc.id,
      data: { dateDebut, dateFin },
      overrideAccess: true,
    });
    console.log(`· ${doc.slug}: ${dateDebut} → ${dateFin}`);
    updated += 1;
  }

  console.log(`✓ ${updated} formation(s) datée(s)`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
