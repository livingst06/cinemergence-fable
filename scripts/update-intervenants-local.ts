/** Update intervenant portraits on local Payload (Postgres + /media). */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { getPayloadClient } = await import("../src/lib/payload");
  const { seedIntervenantPhotosOnly } = await import("../src/seed/media-lib");
  const { getIntervenantPhotoPaths } = await import("../src/seed/intervenant-photos");

  console.log("Portraits détectés:", getIntervenantPhotoPaths());
  const payload = await getPayloadClient();
  const logs = await seedIntervenantPhotosOnly(payload, { force: true });
  for (const line of logs) console.log(line);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
