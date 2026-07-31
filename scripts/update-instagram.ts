/**
 * Align Payload site-settings.instagramUrl on local or production DB.
 * Usage:
 *   pnpm sync:instagram:local
 *   pnpm sync:instagram
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

const target = process.argv.includes("--local") ? "local" : "prod";

loadEnvConfig(process.cwd());
if (target === "prod") {
  loadEnvFile(path.resolve(".env.vercel.production"));
}

async function main() {
  const { defaultSite } = await import("../src/lib/defaults");
  const { getPayloadClient } = await import("../src/lib/payload");

  if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) {
    throw new Error(
      target === "prod"
        ? "DATABASE_URI et PAYLOAD_SECRET requis dans .env.vercel.production"
        : "DATABASE_URI et PAYLOAD_SECRET requis (.env.local)",
    );
  }

  const payload = await getPayloadClient();
  const instagramUrl = defaultSite.instagramUrl;

  await payload.updateGlobal({
    slug: "site-settings",
    data: { instagramUrl },
  });

  const current = await payload.findGlobal({ slug: "site-settings" });
  console.log(`✓ [${target}] site-settings.instagramUrl → ${current.instagramUrl}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
