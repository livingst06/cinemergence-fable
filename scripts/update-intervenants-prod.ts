/**
 * Update intervenant portraits only (local or prod Supabase).
 * Usage: pnpm migrate:intervenants
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
  const { assertS3StorageConfigured } = await import("../src/lib/storage-env");
  const { getPayloadClient } = await import("../src/lib/payload");
  const { seedIntervenantPhotosOnly } = await import("../src/seed/media-lib");
  const { getIntervenantPhotoPaths } = await import("../src/seed/intervenant-photos");

  assertS3StorageConfigured();

  const photos = getIntervenantPhotoPaths();
  console.log("Portraits détectés:", photos);

  const payload = await getPayloadClient();
  const logs = await seedIntervenantPhotosOnly(payload, { force: true });
  for (const line of logs) console.log(line);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
