/**
 * S'assure que le compte admin (verdat.sylvain@gmail.com) a bien role: "admin"
 * en production, avant/après sa première connexion via Clerk (voir
 * src/lib/clerk-strategy.ts qui lie automatiquement par email mais ne touche
 * jamais au role d'un compte existant). Renomme aussi l'ex-email de seed local
 * (admin@cinemergence.paris) si le document existe encore sous cette forme.
 *
 * Usage: pnpm migrate:admin-role
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
Object.assign(process.env, { NODE_ENV: "development" });

async function main() {
  const { getPayloadClient } = await import("../src/lib/payload");
  const { ensureAdminRole } = await import("../src/lib/ensure-admin-role");
  const payload = await getPayloadClient();

  const log = await ensureAdminRole(payload);
  console.log(log ?? "✓ Rien à migrer — le compte admin est déjà à jour (ou n'existe pas encore).");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
