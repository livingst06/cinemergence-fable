/**
 * Remplace les tirets cadratin « — » par des retours à la ligne
 * dans les libellés formations (durée, format, lieu, accroche, sous-titre).
 *
 * Usage:
 *   NODE_OPTIONS='--require ./scripts/next-env-shim.cjs' pnpm exec tsx scripts/fix-emdash-labels.ts
 */
import fs from "fs";
import path from "path";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let value = t.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

const FIELDS = ["duree", "format", "lieu", "accroche", "sousTitre"] as const;

async function main() {
  const { getPayloadClient } = await import("../src/lib/payload");
  const { emDashToNewlines } = await import("../src/lib/formation-types");
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "formations",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });

  let updated = 0;
  let skipped = 0;

  for (const doc of result.docs) {
    const patch: Record<string, string> = {};
    for (const field of FIELDS) {
      const raw = doc[field];
      if (typeof raw !== "string" || !raw.trim()) continue;
      if (!/[—–]/.test(raw)) continue;
      const next = emDashToNewlines(raw);
      if (next !== raw) patch[field] = next;
    }

    if (Object.keys(patch).length === 0) {
      skipped += 1;
      continue;
    }

    await payload.update({
      collection: "formations",
      id: doc.id,
      data: patch,
      overrideAccess: true,
    });
    updated += 1;
    console.log(
      `✓ ${doc.slug ?? doc.id}: ${Object.keys(patch).join(", ")}`,
    );
  }

  console.log(
    `\nTerminé : ${updated} formation(s) mises à jour, ${skipped} déjà OK (sur ${result.docs.length}).`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
