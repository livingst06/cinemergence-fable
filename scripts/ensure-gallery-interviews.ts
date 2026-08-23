/**
 * Lie les interviews galerie (fichiers déjà dans le bucket) aux documents CMS.
 *
 * Usage: pnpm exec tsx scripts/ensure-gallery-interviews.ts
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
Object.assign(process.env, {
  MEDIA_STORAGE: process.env.MEDIA_STORAGE || "supabase",
});

async function main() {
  const { getPayloadClient } = await import("../src/lib/payload");
  const { ensureGalleryInterviews } = await import("../src/lib/ensure-gallery-cms");
  const payload = await getPayloadClient();
  const logs = await ensureGalleryInterviews(payload);
  for (const line of logs) console.log(line);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
