export type FinancementKey = "afdas" | "opco" | "cpf" | "france-travail";

/**
 * Organismes visibles sur le site public.
 * Vide tant que Cinémergence n'est pas référencée (AFDAS, OPCO, CPF, France Travail).
 * Pour réactiver un logo / une mention, ajouter la clé ici — le reste du code est déjà en place.
 */
export const PUBLIC_FINANCEMENT_KEYS: FinancementKey[] = [];

export function publicFinancements(keys: unknown): FinancementKey[] {
  if (!Array.isArray(keys)) return [];
  return keys.filter((k): k is FinancementKey =>
    PUBLIC_FINANCEMENT_KEYS.includes(k as FinancementKey),
  );
}

export type FaqItem = { q: string; r: string };

export type ProgrammeSequence = {
  titre: string;
  duree?: string;
  detail?: string;
};

/** Jour (ou module) du programme — compatible fiche Qualiopi et ancien format. */
export type ProgrammeJour = {
  jour?: number;
  titre: string;
  objectifJournee?: string;
  detail?: string;
  sequences?: ProgrammeSequence[];
};

export type FormationData = {
  /** ID Payload CMS — absent pour les fallbacks catalogue statique. */
  id?: number | string;
  slug: string;
  pole: string;
  titre: string;
  titreCourt: string;
  /** Sous-titre / accroche courte sous l'intitulé (fiche). */
  sousTitre?: string;
  prioritaire: boolean;
  /** Public catalogue : intermittents / audiovisuel vs entreprise. */
  audience: "intermittent" | "entreprise";
  accroche: string;
  publicCible: string;
  /** Libellé court pour cartes (legacy + display). */
  livrable: string;
  livrables?: string[];
  intro: string;
  /** Contexte et finalité professionnelle (fiche §2). */
  contexteFinalite?: string;
  pourQui: string;
  objectifs: string[];
  competences?: string[];
  programme: ProgrammeJour[];
  duree: string;
  dureeHeures?: number;
  dureeJours?: number;
  format: string;
  modalite?: string;
  effectifMax?: number;
  /** Places pour la session datée (réservations). */
  placesOffertes?: number;
  dateDebut?: string;
  dateFin?: string;
  prerequis?: string;
  lieu?: string;
  delaiAcces?: string;
  tarif: string | null;
  /** Montant Stripe en euros entiers (ex. 1400). */
  tarifEuros?: number;
  financements: FinancementKey[];
  methodesPedagogiques?: string[];
  moyensTechniques?: string[];
  encadrement?: string;
  evaluation?: string;
  accessibilite?: string;
  modalitesAccesFinancement?: string;
  intervenants: string[];
  faq: FaqItem[];
  metaTitle: string;
  metaDescription: string;
  coverImageUrl?: string;
  coverImageMimeType?: string;
  /** ID media de la cover (édition admin). */
  coverImageId?: number | string;
  /** Galerie ordonnée (1re = cover). */
  galleryImages?: { id: number | string; url: string }[];
  /** URLs galerie pour la fiche détail. */
  galleryUrls?: string[];
};

export function formationPath(slug: string) {
  return `/formations/${slug}`;
}

export function formationLivrableLabel(formation: Pick<FormationData, "livrable" | "livrables">) {
  if (formation.livrables && formation.livrables.length > 0) {
    return formation.livrables.join(" · ");
  }
  return formation.livrable;
}

/**
 * Remplace les tirets cadratin / demi-cadratin par des retours à la ligne
 * (ex. « 35 heures — 5 journées » → deux lignes).
 */
export function emDashToNewlines(value: string): string {
  return value
    .replace(/\s*[—–]\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** « 63 heures sur 9 jours » pour les cards (fallback parse du libellé duree). */
export function formationDureeCardLabel(
  formation: Pick<FormationData, "duree" | "dureeHeures" | "dureeJours">,
): string | null {
  let heures = formation.dureeHeures;
  let jours = formation.dureeJours;
  if ((heures == null || jours == null) && formation.duree) {
    const h = formation.duree.match(/(\d+)\s*heures?/i);
    const j = formation.duree.match(/(\d+)\s*(?:journ[eé]es?|jours?)/i);
    if (heures == null && h) heures = Number(h[1]);
    if (jours == null && j) jours = Number(j[1]);
  }
  if (heures == null && jours == null) return null;
  if (heures != null && jours != null) {
    return `${heures} heure${heures > 1 ? "s" : ""} sur ${jours} jour${jours > 1 ? "s" : ""}`;
  }
  if (heures != null) return `${heures} heure${heures > 1 ? "s" : ""}`;
  return `${jours} jour${jours! > 1 ? "s" : ""}`;
}
