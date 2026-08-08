/**
 * Crée une session par formation (dates/places existantes) et rattache les inscriptions.
 * Usage: pnpm migrate:sessions
 */
import fs from "fs";
import path from "path";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

loadEnvFile(path.resolve(".env.local"));
loadEnvFile(path.resolve(".env"));

async function main() {
  const { getPayloadClient } = await import("../src/lib/payload");
  const { datesFromSlug, placesFromSlug } = await import("../src/lib/defaults");
  const payload = await getPayloadClient();

  const formations = await payload.find({
    collection: "formations",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });

  let created = 0;
  let linked = 0;

  for (const f of formations.docs) {
    const existing = await payload.find({
      collection: "formation-sessions",
      where: { formation: { equals: f.id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    let sessionId = existing.docs[0]?.id;

    if (!sessionId) {
      const slug = String(f.slug);
      const fallbackDates = datesFromSlug(slug);
      const dateDebut = f.dateDebut
        ? String(f.dateDebut).slice(0, 10)
        : fallbackDates.dateDebut;
      const dateFin = f.dateFin
        ? String(f.dateFin).slice(0, 10)
        : fallbackDates.dateFin;
      const places =
        typeof f.placesOffertes === "number"
          ? f.placesOffertes
          : typeof f.effectifMax === "number"
            ? f.effectifMax
            : placesFromSlug(slug);

      const createdDoc = await payload.create({
        collection: "formation-sessions",
        data: {
          formation: f.id,
          dateDebut,
          dateFin,
          placesOffertes: places,
          tarifEuros:
            typeof f.tarifEuros === "number" && f.tarifEuros > 0
              ? f.tarifEuros
              : undefined,
          active: true,
          label: `Session ${dateDebut} → ${dateFin}`,
        },
        overrideAccess: true,
      });
      sessionId = createdDoc.id;
      created += 1;
      console.log(`+ session ${slug} #${sessionId}`);
    } else {
      console.log(`= session exists ${f.slug} #${sessionId}`);
    }

    const inscriptions = await payload.find({
      collection: "inscriptions",
      where: {
        and: [
          { formation: { equals: f.id } },
          { session: { exists: false } },
        ],
      },
      limit: 200,
      depth: 0,
      overrideAccess: true,
    });

    for (const insc of inscriptions.docs) {
      await payload.update({
        collection: "inscriptions",
        id: insc.id,
        data: { session: sessionId },
        overrideAccess: true,
      });
      linked += 1;
    }
  }

  const orphanInscriptions = await payload.find({
    collection: "inscriptions",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });
  for (const insc of orphanInscriptions.docs) {
    if (insc.session) continue;
    const formationId =
      typeof insc.formation === "object" && insc.formation
        ? (insc.formation as { id: number | string }).id
        : insc.formation;
    if (!formationId) continue;
    const sessions = await payload.find({
      collection: "formation-sessions",
      where: { formation: { equals: formationId } },
      sort: "dateDebut",
      limit: 1,
      overrideAccess: true,
    });
    if (!sessions.docs[0]) continue;
    await payload.update({
      collection: "inscriptions",
      id: insc.id,
      data: { session: sessions.docs[0].id },
      overrideAccess: true,
    });
    linked += 1;
  }

  console.log(`Done. sessions créées=${created}, inscriptions liées=${linked}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
