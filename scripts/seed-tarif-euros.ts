/**
 * Liste formations CMS + force tarifEuros depuis catalogue.
 * Crée une entrée CMS minimale si une formation catalogue n’existe pas encore
 * (nécessaire pour le paiement Stripe).
 *
 * Usage: pnpm seed:tarif-euros
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

async function main() {
  const { getPayloadClient } = await import("../src/lib/payload");
  const { parseEurosFromTarifLabel } = await import("../src/lib/inscription-status");
  const { defaultFormations } = await import("../src/lib/defaults");
  const payload = await getPayloadClient();

  const existing = await payload.find({
    collection: "formations",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });
  const bySlug = new Map(existing.docs.map((d) => [String(d.slug), d]));

  console.log(`CMS: ${existing.docs.length} formation(s)`);

  let updated = 0;
  let created = 0;

  for (const f of defaultFormations) {
    const euros =
      f.tarifEuros ?? parseEurosFromTarifLabel(f.tarif) ?? null;
    if (euros == null) continue;

    const doc = bySlug.get(f.slug);
    if (!doc) {
      // Entrée CMS minimale pour ouvrir le paiement / places
      const places = f.placesOffertes ?? f.effectifMax ?? 10;
      await payload.create({
        collection: "formations",
        data: {
          slug: f.slug,
          titre: f.titre,
          titreCourt: f.titreCourt,
          pole: f.pole,
          accroche: f.accroche,
          prioritaire: f.prioritaire,
          audience: f.audience,
          publicCible: f.publicCible,
          livrable: f.livrable,
          intro: f.intro,
          pourQui: f.pourQui,
          objectifs: (f.objectifs ?? []).map((item) => ({ item })),
          programme: f.programme?.length
            ? f.programme.map((p) => ({
                titre: p.titre,
                detail: p.detail,
              }))
            : [{ titre: "Programme", detail: "À compléter" }],
          duree: f.duree,
          format: f.format,
          tarif: f.tarif,
          tarifEuros: euros,
          placesOffertes: places,
          effectifMax: places,
          dateDebut: f.dateDebut,
          dateFin: f.dateFin,
          metaTitle: f.metaTitle,
          metaDescription: f.metaDescription,
        },
        overrideAccess: true,
      });
      created += 1;
      console.log(`+ ${f.slug}: créée (${euros} €)`);
      continue;
    }

    const current =
      typeof doc.tarifEuros === "number" && doc.tarifEuros > 0
        ? Math.trunc(doc.tarifEuros)
        : null;
    if (current === euros) {
      console.log(`= ${f.slug}: id=${doc.id}, ${euros} €`);
      continue;
    }

    await payload.update({
      collection: "formations",
      id: doc.id,
      data: {
        tarifEuros: euros,
        ...(doc.tarif ? {} : { tarif: f.tarif }),
      },
      overrideAccess: true,
    });
    updated += 1;
    console.log(`✓ ${f.slug}: ${euros} €`);
  }

  console.log(`Done. +${created} créées, ${updated} mises à jour.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
