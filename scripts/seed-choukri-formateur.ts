/**
 * Upsert Choukri Rouha comme formateur dans la collection intervenants.
 * Réutilise SiteSettings.founderPhoto si disponible.
 *
 * Usage: NODE_OPTIONS='--require ./scripts/next-env-shim.cjs' pnpm exec tsx scripts/seed-choukri-formateur.ts
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

const SLUG = "choukri-roua";

async function main() {
  const { getPayloadClient } = await import("../src/lib/payload");
  const { defaultIntervenants } = await import("../src/lib/defaults");
  const payload = await getPayloadClient();

  const def = defaultIntervenants.find((i) => i.slug === SLUG);
  if (!def) {
    throw new Error(`Intervenant ${SLUG} introuvable dans defaultIntervenants`);
  }

  let founderPhotoId: number | string | undefined;
  try {
    const settings = await payload.findGlobal({
      slug: "site-settings",
      depth: 0,
      overrideAccess: true,
    });
    const raw = (settings as { founderPhoto?: unknown }).founderPhoto;
    if (typeof raw === "number" || typeof raw === "string") {
      founderPhotoId = raw;
    } else if (raw && typeof raw === "object" && "id" in raw) {
      founderPhotoId = (raw as { id: number | string }).id;
    }
  } catch {
    // ignore
  }

  const existing = await payload.find({
    collection: "intervenants",
    where: { slug: { equals: SLUG } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const data = {
    slug: def.slug,
    nom: def.nom,
    role: def.role,
    parrain: def.parrain,
    categorie: "formateur" as const,
    bio: def.bio,
    filmographie: (def.filmographie ?? []).map((titre) => ({ titre })),
    ...(founderPhotoId != null ? { photo: founderPhotoId } : {}),
  };

  if (existing.docs[0]) {
    await payload.update({
      collection: "intervenants",
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    });
    console.log(`✓ Mis à jour formateur ${def.nom} (id=${existing.docs[0].id})`);
  } else {
    const created = await payload.create({
      collection: "intervenants",
      data,
      overrideAccess: true,
    });
    console.log(`✓ Créé formateur ${def.nom} (id=${created.id})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
