import { NextResponse } from "next/server";

import {
  defaultFormations,
  defaultIntervenants,
  defaultSite,
  defaultTemoignages,
} from "@/lib/defaults";
import { getPublicSiteUrl } from "@/lib/site-url";
import { getPayloadClient } from "@/lib/payload";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const payload = await getPayloadClient();
    const logs: string[] = [];

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
      logs.push("Admin user created");
    }

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
    logs.push("Site settings updated");

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
    logs.push("Intervenants seeded");

    for (const f of defaultFormations) {
      const existing = await payload.find({
        collection: "formations",
        where: { slug: { equals: f.slug } },
        limit: 1,
      });
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
        intervenants: f.intervenants.map((slug) => intervenantIds[slug]).filter(Boolean),
        faq: f.faq,
        metaTitle: f.metaTitle,
        metaDescription: f.metaDescription,
      };

      if (existing.docs[0]) {
        await payload.update({ collection: "formations", id: existing.docs[0].id, data });
      } else {
        await payload.create({ collection: "formations", data });
      }
    }
    logs.push("Formations seeded");

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
    logs.push("Témoignages seeded");

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("[seed]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seed failed" },
      { status: 500 },
    );
  }
}
