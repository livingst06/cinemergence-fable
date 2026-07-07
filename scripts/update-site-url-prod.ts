/** Align Payload site-settings.url on production Supabase. Usage: pnpm sync:site-url */
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

async function main() {
  const { getPublicSiteUrl } = await import("../src/lib/site-url");
  const { getPayloadClient } = await import("../src/lib/payload");

  const url = getPublicSiteUrl();
  const payload = await getPayloadClient();

  await payload.updateGlobal({
    slug: "site-settings",
    data: { url },
  });

  console.log(`✓ site-settings.url → ${url}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
