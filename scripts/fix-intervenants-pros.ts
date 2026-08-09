/**
 * Force Édouard, Salim, Bibi en catégorie intervenant professionnel.
 *
 * Usage: NODE_OPTIONS='--require ./scripts/next-env-shim.cjs' pnpm exec tsx scripts/fix-intervenants-pros.ts
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

const TARGET_SLUGS = [
  "edouard-montoute",
  "salim-kechiouche",
  "bibi-naceri",
] as const;

async function main() {
  const { getPayloadClient } = await import("../src/lib/payload");
  const { defaultIntervenants } = await import("../src/lib/defaults");
  const payload = await getPayloadClient();

  for (const slug of TARGET_SLUGS) {
    const def = defaultIntervenants.find((i) => i.slug === slug);
    const existing = await payload.find({
      collection: "intervenants",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    const data = {
      slug,
      nom: def?.nom ?? slug,
      role: def?.role ?? "Acteur",
      parrain: def?.parrain ?? slug === "bibi-naceri",
      categorie: "professionnel" as const,
      bio: def?.bio ?? "",
      filmographie: (def?.filmographie ?? []).map((titre) => ({ titre })),
    };

    if (existing.docs[0]) {
      await payload.update({
        collection: "intervenants",
        id: existing.docs[0].id,
        data: {
          categorie: "professionnel",
          nom: data.nom,
          role: data.role,
          parrain: data.parrain,
          bio: data.bio,
          filmographie: data.filmographie,
        },
        overrideAccess: true,
      });
      console.log(
        `✓ ${data.nom} → professionnel (id=${existing.docs[0].id}, was=${existing.docs[0].categorie ?? "null"})`,
      );
    } else {
      const created = await payload.create({
        collection: "intervenants",
        data,
        overrideAccess: true,
      });
      console.log(`✓ Créé ${data.nom} → professionnel (id=${created.id})`);
    }
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
