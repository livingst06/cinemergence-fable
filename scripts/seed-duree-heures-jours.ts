/**
 * Remplit dureeHeures / dureeJours sur les formations CMS depuis le catalogue.
 *
 * Usage: pnpm exec tsx scripts/seed-duree-heures-jours.ts
 */
import fs from "fs";
import path from "path";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
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

function parseFromDureeLabel(duree: string | null | undefined): {
  heures: number | null;
  jours: number | null;
} {
  if (!duree) return { heures: null, jours: null };
  const h = duree.match(/(\d+)\s*heures?/i);
  const j = duree.match(/(\d+)\s*(?:journ[eé]es?|jours?)/i);
  return {
    heures: h ? Number(h[1]) : null,
    jours: j ? Number(j[1]) : null,
  };
}

async function main() {
  const { getPayloadClient } = await import("../src/lib/payload");
  const { defaultFormations } = await import("../src/lib/defaults");
  const payload = await getPayloadClient();

  const catalogBySlug = new Map(defaultFormations.map((f) => [f.slug, f]));
  const existing = await payload.find({
    collection: "formations",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });

  let updated = 0;
  for (const doc of existing.docs) {
    const slug = String(doc.slug);
    const catalog = catalogBySlug.get(slug);
    const parsed = parseFromDureeLabel(
      catalog?.duree ?? (doc.duree ? String(doc.duree) : null),
    );
    const dureeHeures =
      catalog?.dureeHeures ??
      (typeof doc.dureeHeures === "number" ? doc.dureeHeures : null) ??
      parsed.heures;
    const dureeJours =
      catalog?.dureeJours ??
      (typeof doc.dureeJours === "number" ? doc.dureeJours : null) ??
      parsed.jours;

    if (dureeHeures == null && dureeJours == null) {
      console.warn(`skip ${slug}: pas de durée numérique`);
      continue;
    }

    const sameH =
      typeof doc.dureeHeures === "number" && doc.dureeHeures === dureeHeures;
    const sameJ =
      typeof doc.dureeJours === "number" && doc.dureeJours === dureeJours;
    if (sameH && sameJ) continue;

    await payload.update({
      collection: "formations",
      id: doc.id,
      data: {
        ...(dureeHeures != null ? { dureeHeures } : {}),
        ...(dureeJours != null ? { dureeJours } : {}),
        ...(catalog?.duree && doc.duree !== catalog.duree
          ? { duree: catalog.duree }
          : {}),
      },
      overrideAccess: true,
    });
    updated += 1;
    console.log(
      `ok ${slug}: ${dureeHeures ?? "?"} h · ${dureeJours ?? "?"} j`,
    );
  }

  console.log(`Done. ${updated} formation(s) mises à jour.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
