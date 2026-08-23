import type { FormationData } from "./formation-types";

export type { FormationData, FaqItem, FinancementKey, ProgrammeJour } from "./formation-types";
export {
  formationPath,
  formationLivrableLabel,
  formationDureeCardLabel,
  emDashToNewlines,
  publicFinancements,
  PUBLIC_FINANCEMENT_KEYS,
} from "./formation-types";
export {
  defaultFinancement,
  financementGuide,
  type FinancementDispositif,
} from "./financement-content";

/** @deprecated Use ProgrammeJour — kept for seed/CMS compatibility aliases. */
export type Module = import("./formation-types").ProgrammeJour;

export type IntervenantData = {
  /** Présent uniquement pour les docs CMS (édition / suppression admin). */
  id?: number | string;
  slug: string;
  nom: string;
  role: string;
  parrain: boolean;
  /** Guest / intervenant pro vs formateur pédagogique. */
  categorie?: "professionnel" | "formateur";
  /** Email CMS — mails groupés / formulaire admin (pas affiché sur la card publique). */
  email?: string | null;
  bio: string;
  filmographie: string[];
  /** ID media Payload si portrait CMS (édition admin). */
  photoId?: number | string | null;
  photoUrl?: string;
  photoMimeType?: string;
};

export type TemoignageData = {
  profil: "debutant" | "reconversion" | "intermittent";
  quote: string;
  auteur: string;
  formation: string;
};

export const defaultSite = {
  name: "Cinémergence",
  legalName: "Cinémergence — Association loi 1901",
  tagline: "Formations cinéma en conditions réelles de plateau, à Paris.",
  description:
    "Cinémergence, école de formation cinéma à Paris. Formations professionnelles pour comédiens, techniciens et entreprises — encadrées comme de vrais plateaux.",
  url: "https://cinemergence.fr",
  email: "cinemergence.paris@gmail.com",
  phone: "+33 7 69 18 55 94",
  city: "Paris, Île-de-France",
  nda: "117 888 658 78",
  qualiopiObtained: true,
  qualiopiLabel: "Organisme de formation certifié",
  partnerName: "Bakelite Films",
  partnerRole: "Production partenaire",
  partnerUrl: "https://www.bakelitefilms.com",
  instagramUrl: "https://www.instagram.com/cinemergence/",
  youtubeUrl: "https://www.youtube.com/@cinemergence",
} as const;

export const defaultIntervenants: IntervenantData[] = [
  {
    slug: "choukri-roua",
    nom: "Choukri Rouha",
    role: "Réalisateur & fondateur",
    parrain: false,
    categorie: "formateur",
    bio: "Formé au Cours Florent, Choukri Rouha débute comme acteur, puis s'impose à l'écriture et à la réalisation. Il a fondé Cinémergence pour offrir un cadre pro, du matériel cinéma et un résultat concret à chaque élève.",
    filmographie: [],
    photoUrl: "/images/site/founder/choukri-roua.jpg",
    photoMimeType: "image/jpeg",
  },
  {
    slug: "bibi-naceri",
    nom: "Bibi Naceri",
    role: "Acteur, réalisateur & scénariste",
    parrain: true,
    categorie: "professionnel",
    bio: "Parrain de Cinémergence. Acteur, réalisateur et scénariste reconnu, il intervient en masterclass et direction d'acteur : texte, émotion, justesse du jeu face caméra. Un regard pro direct pour faire progresser chaque élève.",
    filmographie: ["Banlieue 13", "Taken", "District 13"],
  },
  {
    slug: "salim-kechiouche",
    nom: "Salim Kéchiouche",
    role: "Acteur",
    parrain: false,
    categorie: "professionnel",
    bio: "Intervenant d'exception sur le plateau. Direction d'acteur exigeante et bienveillante, focus présence caméra et écoute. Les élèves repartent avec des retours concrets, immédiatement exploitables en casting.",
    filmographie: ["L'Esquive", "3 Hearts", "Le Grand Jeu"],
  },
  {
    slug: "edouard-montoute",
    nom: "Édouard Montoute",
    role: "Acteur",
    parrain: false,
    categorie: "professionnel",
    bio: "Comédien polyvalent, il partage son expérience du jeu face caméra en conditions réelles de tournage. Un accompagnement de plateau qui pousse la précision, la présence et la confiance.",
    filmographie: ["Neuilly sa mère", "Les Kaïra", "La Môme"],
  },
  {
    slug: "hassan-zahi",
    nom: "Hassan Zahi",
    role: "Réalisateur & formateur",
    parrain: false,
    categorie: "formateur",
    bio: "Formateur pédagogique. Accompagne les élèves sur la mise en scène, le découpage et la conduite de plateau. Retours pro directs pour gagner en autonomie sur un vrai tournage.",
    filmographie: ["Rose"],
    photoUrl: "/images/formations/formation-realiser-court-metrage.jpg",
    photoMimeType: "image/jpeg",
  },
  {
    slug: "sandy-formateur",
    nom: "Sandy",
    role: "Formatrice pédagogique",
    parrain: false,
    categorie: "formateur",
    bio: "Formatrice pédagogique. Encadre la progression des élèves avec des retours concrets sur le jeu, la préparation et la présence face caméra. Profil à préciser — photo provisoire.",
    filmographie: [],
    photoUrl: "/images/formations/formation-jouer-face-camera.jpg",
    photoMimeType: "image/jpeg",
  },
];

/** Places restantes affichées sur une card (CMS ou catalogue statique). */
export function resolvePlacesRestantesForCard(
  formation: Pick<FormationData, "id" | "placesOffertes" | "effectifMax">,
  placesByFormationId: Record<string, number | null> = {},
): number | null {
  if (formation.id != null) {
    const fromMap = placesByFormationId[String(formation.id)];
    if (fromMap != null) return fromMap;
  }
  if (typeof formation.placesOffertes === "number") return formation.placesOffertes;
  if (typeof formation.effectifMax === "number") return formation.effectifMax;
  return null;
}

export const defaultTemoignages: TemoignageData[] = [
  {
    profil: "debutant",
    quote:
      "Avant la formation, je jouais surtout en théâtre. J'avais du mal avec la caméra. J'ai compris comment gérer mon regard et mon énergie en gros plan. Les images obtenues m'ont permis d'envoyer une bande démo propre aux castings.",
    auteur: "Camille, 27 ans",
    formation: "Tourner sa bande démo",
  },
  {
    profil: "intermittent",
    quote:
      "Le travail est direct. Pas de blabla. On répète, on tourne, on corrige. J'ai surtout progressé sur la justesse et l'écoute. Ça m'a aidé à me sentir plus solide en audition.",
    auteur: "Yanis, 32 ans",
    formation: "Jouer face caméra",
  },
  {
    profil: "debutant",
    quote:
      "Je n'avais aucune bande démo. En deux jours, j'ai travaillé des scènes exigeantes et obtenu des images exploitables. Le regard d'un réalisateur change vraiment la façon d'aborder le jeu.",
    auteur: "Sarah, 24 ans",
    formation: "Tourner sa bande démo",
  },
  {
    profil: "reconversion",
    quote:
      "Ce que j'ai apprécié : les retours précis et concrets. On comprend vite ce qui fonctionne et ce qui sonne faux. Ça remet les idées en place.",
    auteur: "Mehdi, 29 ans",
    formation: "Tourner sa bande démo",
  },
  {
    profil: "intermittent",
    quote:
      "Le cadre est professionnel. On se sent considéré comme un acteur, pas comme un élève. J'ai gagné en confiance face caméra.",
    auteur: "Laura, 35 ans",
    formation: "Jouer face caméra",
  },
  {
    profil: "debutant",
    quote:
      "Je pensais être prêt pour les castings. La formation m'a montré mes faiblesses. Ça m'a forcé à travailler plus finement. Résultat : des images plus crédibles.",
    auteur: "Thomas, 22 ans",
    formation: "Tourner sa bande démo",
  },
];

export const defaultLegal = {
  mentionsLegales: `
Cinémergence — Association loi 1901
Siège : Paris, Île-de-France
Email : cinemergence.paris@gmail.com
Numéro de déclaration d'activité (NDA) : 117 888 658 78

Directeur de la publication : Cinémergence
Hébergeur : à compléter lors de la mise en ligne.

Conformément à l'article L.6351-1 du Code du travail, Cinémergence est un organisme de formation professionnelle continue déclaré auprès de la DREETS.
  `.trim(),
  confidentialite: `
Cinémergence s'engage à protéger les données personnelles collectées via ce site (formulaires de contact, inscription, newsletter).

Données collectées : nom, email, téléphone, message, formation souhaitée.
Finalité : répondre à vos demandes, gérer les inscriptions, envoyer des informations sur nos formations.
Base légale : consentement et intérêt légitime.
Durée de conservation : 3 ans à compter du dernier contact.
Vos droits : accès, rectification, suppression, opposition — contactez cinemergence.paris@gmail.com.
  `.trim(),
  cgv: `
Conditions générales de vente — Cinémergence

Les présentes CGV s'appliquent aux formations proposées par Cinémergence, association loi 1901, NDA 117 888 658 78.

Inscription : toute inscription est confirmée par email après validation du financement ou du paiement.
Annulation : conditions d'annulation communiquées lors de l'inscription.
Financement : les formations peuvent être prises en charge selon éligibilité, après étude de ta situation.
Réclamations : cinemergence.paris@gmail.com
  `.trim(),
};
