/**
 * Supprime les covers orphelines (formations déjà effacées).
 * Usage: pnpm exec tsx — via package script si besoin.
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

async function main() {
  const { getPayloadClient } = await import("../src/lib/payload");
  const { cleanupOrphanFormationCovers } = await import("../src/lib/formation-media");
  const payload = await getPayloadClient();
  const deleted = await cleanupOrphanFormationCovers(payload);
  console.log(`✓ ${deleted} cover(s) orpheline(s) supprimée(s)`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
