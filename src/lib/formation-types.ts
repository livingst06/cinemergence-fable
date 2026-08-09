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

/**
 * Formations visibles sur le site public.
 * Les autres restent dans le CMS pour une réactivation ultérieure.
 */
export const PUBLIC_FORMATION_SLUGS = [
  "kheiron",
  "formation-stand-up",
  "formation-jouer-face-camera",
  "formation-doublage-voix",
  "formation-passer-a-la-realisation",
  "formation-realiser-documentaire",
] as const;

export function isFormationActive(slug: string): boolean {
  return (PUBLIC_FORMATION_SLUGS as readonly string[]).includes(slug);
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
  /** Visible sur le site public. Faux = conservée dans le CMS, masquée. */
  active: boolean;
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

/** Exception : la masterclass Kheiron reste sur cette URL, promo WhatsApp comprise. */
export const KHEIRON_FORMATION_SLUG = "kheiron";
export const KHEIRON_FORMATION_PATH = "/formations/kheiron";

const FORMATION_PATH_EXCEPTIONS: Record<string, string> = {
  [KHEIRON_FORMATION_SLUG]: KHEIRON_FORMATION_PATH,
  "formation-kheiron": KHEIRON_FORMATION_PATH,
  "masterclass-kheiron": KHEIRON_FORMATION_PATH,
  "masterclass-avec-kheiron": KHEIRON_FORMATION_PATH,
};

export function formationPath(slug: string) {
  return FORMATION_PATH_EXCEPTIONS[slug] ?? `/formations/${slug}`;
}

export function canonicalFormationSlug(slug: string) {
  if (FORMATION_PATH_EXCEPTIONS[slug] === KHEIRON_FORMATION_PATH) return KHEIRON_FORMATION_SLUG;
  return slug;
}

export function formationLivrableLabel(formation: Pick<FormationData, "livrable" | "livrables">) {
  if (formation.livrables && formation.livrables.length > 0) {
    return formation.livrables.join(" · ");
  }
  return formation.livrable;
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
