/**
 * Migrate media from _assets-client/ to production (Supabase Postgres + Storage).
 * Run locally — Vercel serverless lacks sharp, ffmpeg, and client assets.
 *
 * Usage: pnpm migrate:prod
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
process.env.MEDIA_STORAGE = "supabase";
// development → Payload pousse le schéma Postgres ; S3 forcé via MEDIA_STORAGE
process.env.NODE_ENV = "development";

async function seedContentIfEmpty(payload: Awaited<ReturnType<typeof import("../src/lib/payload").getPayloadClient>>) {
  const { defaultFormations, defaultIntervenants, defaultSite, defaultTemoignages } =
    await import("../src/lib/defaults");

  const formations = await payload.find({ collection: "formations", limit: 1 });
  if (formations.totalDocs > 0) return;

  console.log("Seed contenu CMS (prod vide)…");

  const existingUser = await payload.find({ collection: "users", limit: 1 });
  if (existingUser.docs.length === 0) {
    await payload.create({
      collection: "users",
      data: {
        email: "admin@cinemergence.paris",
        password: "ChangeMe123!",
        name: "Admin Cinémergence",
      },
    });
    console.log("✓ Admin créé");
  }

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      name: defaultSite.name,
      tagline: defaultSite.tagline,
      description: defaultSite.description,
      url: defaultSite.url,
      email: defaultSite.email,
      nda: defaultSite.nda,
      qualiopiObtained: defaultSite.qualiopiObtained,
      qualiopiLabel: defaultSite.qualiopiLabel,
      partnerName: defaultSite.partnerName,
      instagramUrl: defaultSite.instagramUrl,
    },
  });

  const intervenantIds: Record<string, number | string> = {};
  for (const i of defaultIntervenants) {
    const created = await payload.create({
      collection: "intervenants",
      data: {
        slug: i.slug,
        nom: i.nom,
        role: i.role,
        parrain: i.parrain,
        bio: i.bio,
        filmographie: i.filmographie.map((titre) => ({ titre })),
      },
    });
    intervenantIds[i.slug] = created.id;
  }

  for (const f of defaultFormations) {
    await payload.create({
      collection: "formations",
      data: {
        slug: f.slug,
        pole: f.pole,
        titre: f.titre,
        titreCourt: f.titreCourt,
        prioritaire: f.prioritaire,
        accroche: f.accroche,
        publicCible: f.publicCible,
        livrable: f.livrable,
        intro: f.intro,
        pourQui: f.pourQui,
        objectifs: f.objectifs.map((item) => ({ item })),
        programme: f.programme,
        duree: f.duree,
        format: f.format,
        tarif: f.tarif ?? undefined,
        financements: f.financements,
        intervenants: f.intervenants.map((slug) => intervenantIds[slug]).filter(Boolean),
        faq: f.faq,
        metaTitle: f.metaTitle,
        metaDescription: f.metaDescription,
      },
    });
  }

  for (const t of defaultTemoignages) {
    await payload.create({ collection: "temoignages", data: t });
  }
  console.log("✓ Contenu de base importé");
}

async function main() {
  const { assertS3StorageConfigured } = await import("../src/lib/storage-env");
  const { getPayloadClient } = await import("../src/lib/payload");
  const { seedMediaContent } = await import("../src/seed/media-lib");

  assertS3StorageConfigured();

  if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) {
    throw new Error("DATABASE_URI et PAYLOAD_SECRET requis dans .env.vercel.production");
  }

  console.log("Migration médias → Supabase (prod)…");
  const payload = await getPayloadClient();
  await seedContentIfEmpty(payload);
  const logs = await seedMediaContent(payload, { force: true });
  for (const line of logs) console.log(line);
  console.log("Terminé.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
