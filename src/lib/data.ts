import {
  defaultFinancement,
  defaultFormations,
  defaultIntervenants,
  defaultSite,
  defaultTemoignages,
  type FormationData,
  type IntervenantData,
  type TemoignageData,
} from "./defaults";
import { getPayloadClient } from "./payload";

export type SiteConfig = {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  phone: string;
  city: string;
  nda: string;
  qualiopiObtained: boolean;
  qualiopiLabel: string;
  partnerName: string;
  partnerRole: string;
  instagramUrl: string;
};

export async function getSiteSettings(): Promise<SiteConfig> {
  try {
    const payload = await getPayloadClient();
    const settings = await payload.findGlobal({ slug: "site-settings" });
    return {
      name: settings.name ?? defaultSite.name,
      legalName: defaultSite.legalName,
      tagline: settings.tagline ?? defaultSite.tagline,
      description: settings.description ?? defaultSite.description,
      url: settings.url ?? defaultSite.url,
      email: settings.email ?? defaultSite.email,
      phone: defaultSite.phone,
      city: defaultSite.city,
      nda: settings.nda ?? defaultSite.nda,
      qualiopiObtained: settings.qualiopiObtained ?? defaultSite.qualiopiObtained,
      qualiopiLabel: settings.qualiopiLabel ?? defaultSite.qualiopiLabel,
      partnerName: settings.partnerName ?? defaultSite.partnerName,
      partnerRole: defaultSite.partnerRole,
      instagramUrl: settings.instagramUrl ?? defaultSite.instagramUrl,
    };
  } catch {
    return defaultSite;
  }
}

function mapFormation(doc: Record<string, unknown>): FormationData {
  return {
    slug: String(doc.slug),
    pole: String(doc.pole),
    titre: String(doc.titre),
    titreCourt: String(doc.titreCourt),
    prioritaire: Boolean(doc.prioritaire),
    accroche: String(doc.accroche),
    publicCible: String(doc.publicCible),
    livrable: String(doc.livrable),
    intro: String(doc.intro),
    pourQui: String(doc.pourQui),
    objectifs: (doc.objectifs as { item: string }[] | undefined)?.map((o) => o.item) ?? [],
    programme: (doc.programme as { titre: string; detail: string }[] | undefined) ?? [],
    duree: String(doc.duree),
    format: String(doc.format),
    tarif: doc.tarif ? String(doc.tarif) : null,
    financements: (doc.financements as FormationData["financements"]) ?? [],
    intervenants: [],
    faq: (doc.faq as { q: string; r: string }[] | undefined) ?? [],
    metaTitle: String(doc.metaTitle),
    metaDescription: String(doc.metaDescription),
  };
}

export async function getFormations(): Promise<FormationData[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "formations",
      limit: 20,
      sort: "-prioritaire",
    });
    if (result.docs.length === 0) return defaultFormations;
    return result.docs.map((doc) => mapFormation(doc as Record<string, unknown>));
  } catch {
    return defaultFormations;
  }
}

export async function getFormationBySlug(slug: string): Promise<FormationData | null> {
  const formations = await getFormations();
  return formations.find((f) => f.slug === slug) ?? null;
}

function mapIntervenant(doc: Record<string, unknown>): IntervenantData {
  return {
    slug: String(doc.slug),
    nom: String(doc.nom),
    role: String(doc.role),
    parrain: Boolean(doc.parrain),
    bio: String(doc.bio),
    filmographie:
      (doc.filmographie as { titre: string }[] | undefined)?.map((f) => f.titre) ?? [],
  };
}

export async function getIntervenants(): Promise<IntervenantData[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({ collection: "intervenants", limit: 20 });
    if (result.docs.length === 0) return defaultIntervenants;
    return result.docs.map((doc) => mapIntervenant(doc as Record<string, unknown>));
  } catch {
    return defaultIntervenants;
  }
}

export async function getTemoignages(): Promise<TemoignageData[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({ collection: "temoignages", limit: 10 });
    if (result.docs.length === 0) return defaultTemoignages;
    return result.docs.map((doc) => ({
      profil: doc.profil as TemoignageData["profil"],
      quote: String(doc.quote),
      auteur: String(doc.auteur),
      formation: String(doc.formation ?? ""),
    }));
  } catch {
    return defaultTemoignages;
  }
}

export async function getFinancementDispositifs() {
  return defaultFinancement;
}

export async function getLegalContent() {
  try {
    const payload = await getPayloadClient();
    const legal = await payload.findGlobal({ slug: "legal-pages" });
    return {
      mentionsLegales: legal.mentionsLegales ? "[rich-text]" : undefined,
      confidentialite: legal.confidentialite ? "[rich-text]" : undefined,
      cgv: legal.cgv ? "[rich-text]" : undefined,
    };
  } catch {
    return null;
  }
}

export async function getGalleryMedia() {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "media",
      limit: 24,
      where: { category: { not_equals: "portrait" } },
    });
    return result.docs;
  } catch {
    return [];
  }
}
