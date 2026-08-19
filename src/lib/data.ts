import { sanitizeEncadrement, sanitizePedagogyList } from "./formation-format";
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
import {
  isImageMimeType,
  resolveDisplayMediaUrl,
  resolveMediaMimeType,
} from "./media-utils";
import { getPayloadClient } from "./payload";
import { isLocalMediaStorage } from "./storage-env";
import { getPublicSiteUrl } from "./site-url";
import {
  getStaticCarouselItems,
  resolveFormationCoverUrl,
  staticFounderPhoto,
  staticFounderPhotoCommitted,
  staticGalleryItems,
  staticIntervenantPhotos,
} from "./site-media";

function staticFormationCover(slug: string) {
  return resolveFormationCoverUrl(slug);
}

function staticIntervenantPhoto(slug: string) {
  return isLocalMediaStorage() ? staticIntervenantPhotos[slug] : undefined;
}

export type GalleryMediaItem = {
  id: string | number;
  alt: string;
  url?: string;
  mimeType?: string;
  caption?: string;
  category?: string;
};

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
  founderPhotoUrl?: string;
  founderPhotoMimeType?: string;
};

export async function getSiteSettings(): Promise<SiteConfig> {
  try {
    const payload = await getPayloadClient();
    const settings = await payload.findGlobal({ slug: "site-settings", depth: 1 });
    const staticFounder = isLocalMediaStorage()
      ? staticFounderPhoto
      : staticFounderPhotoCommitted;
    return {
      name: settings.name ?? defaultSite.name,
      legalName: defaultSite.legalName,
      tagline: settings.tagline ?? defaultSite.tagline,
      description: settings.description ?? defaultSite.description,
      url: getPublicSiteUrl(),
      email: settings.email ?? defaultSite.email,
      phone: defaultSite.phone,
      city: defaultSite.city,
      nda: settings.nda ?? defaultSite.nda,
      qualiopiObtained: true,
      qualiopiLabel: "Organisme de formation certifié",
      partnerName: settings.partnerName ?? defaultSite.partnerName,
      partnerRole: defaultSite.partnerRole,
      instagramUrl: settings.instagramUrl ?? defaultSite.instagramUrl,
      founderPhotoUrl: resolveDisplayMediaUrl(settings.founderPhoto, staticFounder),
      founderPhotoMimeType: resolveMediaMimeType(settings.founderPhoto),
    };
  } catch {
    return {
      ...defaultSite,
      url: getPublicSiteUrl(),
      founderPhotoUrl: isLocalMediaStorage()
        ? staticFounderPhoto
        : staticFounderPhotoCommitted,
    };
  }
}

function mapIntervenantSlugs(doc: Record<string, unknown>): string[] {
  const raw = doc.intervenants;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (typeof item === "object" && item && "slug" in item) {
        return String((item as { slug: string }).slug);
      }
      return null;
    })
    .filter((slug): slug is string => Boolean(slug));
}

function mapStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item && "item" in item) {
        return String((item as { item: string }).item);
      }
      return null;
    })
    .filter((v): v is string => Boolean(v));
}

function mapProgramme(raw: unknown): FormationData["programme"] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = item as Record<string, unknown>;
    const sequencesRaw = row.sequences;
    const sequences = Array.isArray(sequencesRaw)
      ? sequencesRaw.map((seq) => {
          const s = seq as Record<string, unknown>;
          return {
            titre: String(s.titre ?? ""),
            duree: s.duree ? String(s.duree) : undefined,
            detail: s.detail ? String(s.detail) : undefined,
          };
        })
      : undefined;
    return {
      jour: typeof row.jour === "number" ? row.jour : undefined,
      titre: String(row.titre ?? ""),
      objectifJournee: row.objectifJournee ? String(row.objectifJournee) : undefined,
      detail: row.detail ? String(row.detail) : undefined,
      sequences,
    };
  });
}

function mapFormation(doc: Record<string, unknown>): FormationData {
  return {
    slug: String(doc.slug),
    pole: String(doc.pole),
    titre: String(doc.titre),
    titreCourt: String(doc.titreCourt),
    sousTitre: doc.sousTitre ? String(doc.sousTitre) : undefined,
    prioritaire: Boolean(doc.prioritaire),
    audience:
      doc.audience === "entreprise" || doc.audience === "intermittent"
        ? doc.audience
        : "intermittent",
    accroche: String(doc.accroche),
    publicCible: String(doc.publicCible),
    livrable: String(doc.livrable),
    livrables: mapStringArray(doc.livrables),
    intro: String(doc.intro),
    contexteFinalite: doc.contexteFinalite ? String(doc.contexteFinalite) : undefined,
    pourQui: String(doc.pourQui),
    objectifs: mapStringArray(doc.objectifs),
    competences: mapStringArray(doc.competences),
    programme: mapProgramme(doc.programme),
    duree: String(doc.duree),
    dureeHeures: typeof doc.dureeHeures === "number" ? doc.dureeHeures : undefined,
    dureeJours: typeof doc.dureeJours === "number" ? doc.dureeJours : undefined,
    format: String(doc.format),
    modalite: doc.modalite ? String(doc.modalite) : undefined,
    effectifMax: typeof doc.effectifMax === "number" ? doc.effectifMax : undefined,
    prerequis: doc.prerequis ? String(doc.prerequis) : undefined,
    lieu: doc.lieu ? String(doc.lieu) : undefined,
    delaiAcces: doc.delaiAcces ? String(doc.delaiAcces) : undefined,
    tarif: doc.tarif ? String(doc.tarif) : null,
    financements: (doc.financements as FormationData["financements"]) ?? [],
    methodesPedagogiques: sanitizePedagogyList(mapStringArray(doc.methodesPedagogiques)),
    moyensTechniques: sanitizePedagogyList(mapStringArray(doc.moyensTechniques)),
    encadrement: sanitizeEncadrement(
      doc.encadrement ? String(doc.encadrement) : undefined,
    ),
    evaluation: doc.evaluation ? String(doc.evaluation) : undefined,
    accessibilite: doc.accessibilite ? String(doc.accessibilite) : undefined,
    modalitesAccesFinancement: doc.modalitesAccesFinancement
      ? String(doc.modalitesAccesFinancement)
      : undefined,
    intervenants: mapIntervenantSlugs(doc),
    faq: (doc.faq as { q: string; r: string }[] | undefined) ?? [],
    metaTitle: String(doc.metaTitle),
    metaDescription: String(doc.metaDescription),
    coverImageUrl: resolveDisplayMediaUrl(
      doc.coverImage,
      staticFormationCover(String(doc.slug)),
    ),
    coverImageMimeType: resolveMediaMimeType(doc.coverImage),
  };
}

export async function getFormations(): Promise<FormationData[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "formations",
      limit: 50,
      sort: "-prioritaire",
      depth: 1,
    });
    if (result.docs.length === 0 || result.docs.length < defaultFormations.length) {
      return defaultFormations.map((f) => ({
        ...f,
        coverImageUrl: f.coverImageUrl ?? staticFormationCover(f.slug),
      }));
    }
    return result.docs.map((doc) => mapFormation(doc as Record<string, unknown>));
  } catch {
    return defaultFormations.map((f) => ({
      ...f,
      coverImageUrl: f.coverImageUrl ?? staticFormationCover(f.slug),
    }));
  }
}

export async function getFormationBySlug(slug: string): Promise<FormationData | null> {
  const formations = await getFormations();
  return formations.find((f) => f.slug === slug) ?? null;
}

function mapIntervenant(doc: Record<string, unknown>): IntervenantData {
  const categorie =
    doc.categorie === "formateur" || doc.categorie === "professionnel"
      ? doc.categorie
      : "professionnel";
  return {
    slug: String(doc.slug),
    nom: String(doc.nom),
    role: String(doc.role),
    parrain: Boolean(doc.parrain),
    categorie,
    bio: String(doc.bio),
    filmographie:
      (doc.filmographie as { titre: string }[] | undefined)?.map((f) => f.titre) ?? [],
    photoUrl: resolveDisplayMediaUrl(doc.photo, staticIntervenantPhoto(String(doc.slug))),
    photoMimeType: resolveMediaMimeType(doc.photo),
  };
}

export async function getIntervenants(): Promise<IntervenantData[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({ collection: "intervenants", limit: 20, depth: 1 });
    if (result.docs.length === 0) {
      return defaultIntervenants.map((i) => ({
        ...i,
        photoUrl: i.photoUrl ?? staticIntervenantPhoto(i.slug),
      }));
    }
    const fromCms = result.docs
      .map((doc) => mapIntervenant(doc as Record<string, unknown>))
      .filter((i) => i.slug !== "karina-testa");
    const cmsSlugs = new Set(fromCms.map((i) => i.slug));
    const missingFormateurs = defaultIntervenants.filter(
      (i) => i.categorie === "formateur" && !cmsSlugs.has(i.slug),
    );
    return [...fromCms, ...missingFormateurs];
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

export async function getGalleryMedia(): Promise<GalleryMediaItem[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "media",
      limit: 24,
      where: { category: { not_equals: "portrait" } },
    });
    const fromCms = result.docs.flatMap((doc, index) => {
      const fallback = isLocalMediaStorage() ? staticGalleryItems[index] : undefined;
      const url = resolveDisplayMediaUrl(doc, fallback?.url);
      if (!url) return [];
      return [
        {
          id: doc.id,
          alt: String(doc.alt ?? fallback?.alt ?? "Média Cinémergence"),
          url,
          mimeType: resolveMediaMimeType(doc) ?? fallback?.mimeType,
          caption: doc.caption ? String(doc.caption) : undefined,
          category: doc.category ? String(doc.category) : undefined,
        } satisfies GalleryMediaItem,
      ];
    });

    if (fromCms.length > 0) return fromCms;
    return isLocalMediaStorage() ? staticGalleryItems : [];
  } catch {
    return isLocalMediaStorage() ? staticGalleryItems : [];
  }
}

export async function getCarouselMedia(limit = 8): Promise<GalleryMediaItem[]> {
  const media = await getGalleryMedia();
  const fromCms = media
    .filter((item) => item.url && isImageMimeType(item.mimeType, item.url))
    .slice(0, limit);

  if (fromCms.length > 0) return fromCms;
  return isLocalMediaStorage() ? getStaticCarouselItems(limit) : [];
}
