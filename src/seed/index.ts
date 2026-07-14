import { config } from "dotenv";

config({ path: ".env.local" });

async function seed() {
  const {
    defaultFormations,
    defaultIntervenants,
    defaultSite,
    defaultTemoignages,
  } = await import("../lib/defaults");
  const { getPayloadClient } = await import("../lib/payload");
  const { getPublicSiteUrl } = await import("../lib/site-url");

  const payload = await getPayloadClient();

  // Authentification déléguée à Clerk (voir src/lib/clerk-strategy.ts) : le
  // document `users` admin se crée automatiquement à la première connexion
  // Clerk, ou se lie à un compte existant. On s'assure ici seulement qu'un
  // éventuel compte préexistant a bien role: admin (et le bon email).
  const { ensureAdminRole } = await import("../lib/ensure-admin-role");
  const adminLog = await ensureAdminRole(payload);
  if (adminLog) console.log(`✓ ${adminLog}`);

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      name: defaultSite.name,
      tagline: defaultSite.tagline,
      description: defaultSite.description,
      url: getPublicSiteUrl(),
      email: defaultSite.email,
      nda: defaultSite.nda,
      qualiopiObtained: defaultSite.qualiopiObtained,
      qualiopiLabel: defaultSite.qualiopiLabel,
      partnerName: defaultSite.partnerName,
      instagramUrl: defaultSite.instagramUrl,
    },
  });
  console.log("✓ Site settings seeded");

  const intervenantIds: Record<string, number | string> = {};
  for (const i of defaultIntervenants) {
    const existing = await payload.find({
      collection: "intervenants",
      where: { slug: { equals: i.slug } },
      limit: 1,
    });
    if (existing.docs[0]) {
      intervenantIds[i.slug] = existing.docs[0].id;
    } else {
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
  }
  console.log("✓ Intervenants seeded");

  for (const f of defaultFormations) {
    const existing = await payload.find({
      collection: "formations",
      where: { slug: { equals: f.slug } },
      limit: 1,
    });
    const intervenantRelations = f.intervenants
      .map((slug) => intervenantIds[slug])
      .filter(Boolean);

    const data = {
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
      intervenants: intervenantRelations,
      faq: f.faq,
      metaTitle: f.metaTitle,
      metaDescription: f.metaDescription,
    };

    if (existing.docs[0]) {
      await payload.update({
        collection: "formations",
        id: existing.docs[0].id,
        data,
      });
    } else {
      await payload.create({ collection: "formations", data });
    }
  }
  console.log("✓ Formations seeded");

  for (const t of defaultTemoignages) {
    const existing = await payload.find({
      collection: "temoignages",
      where: { auteur: { equals: t.auteur } },
      limit: 1,
    });
    if (!existing.docs[0]) {
      await payload.create({ collection: "temoignages", data: t });
    }
  }
  console.log("✓ Témoignages seeded");
  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
