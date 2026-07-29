export type FinancementKey = "afdas" | "opco" | "cpf" | "france-travail";

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
  slug: string;
  pole: string;
  titre: string;
  titreCourt: string;
  /** Sous-titre / accroche courte sous l'intitulé (fiche). */
  sousTitre?: string;
  prioritaire: boolean;
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
  prerequis?: string;
  lieu?: string;
  delaiAcces?: string;
  tarif: string | null;
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
