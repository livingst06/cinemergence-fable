import type { FormationData, FaqItem, FinancementKey, ProgrammeJour } from "./formation-types";
import { isFormationActive } from "./formation-types";
import { formationsCatalog } from "./formations-catalog";

export type { FormationData, FaqItem, FinancementKey, ProgrammeJour } from "./formation-types";
export {
  canonicalFormationSlug,
  formationPath,
  formationLivrableLabel,
  isFormationActive,
  KHEIRON_FORMATION_PATH,
  KHEIRON_FORMATION_SLUG,
  publicFinancements,
  PUBLIC_FINANCEMENT_KEYS,
  PUBLIC_FORMATION_SLUGS,
} from "./formation-types";

/** @deprecated Use ProgrammeJour — kept for seed/CMS compatibility aliases. */
export type Module = ProgrammeJour;

export type IntervenantData = {
  slug: string;
  nom: string;
  role: string;
  parrain: boolean;
  /** Guest / intervenant pro vs formateur pédagogique. */
  categorie?: "professionnel" | "formateur";
  bio: string;
  filmographie: string[];
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
  email: "contact@cinemergence.fr",
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

/** Formateurs affichés sur le site, en plus des intervenants professionnels. */
export const publicFormateurSlugs = ["phil-darwin", "formateur-mystere"] as const;

export const defaultIntervenants: IntervenantData[] = [
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
  {
    slug: "kheiron",
    nom: "Kheiron",
    role: "Humoriste, auteur et réalisateur",
    parrain: false,
    categorie: "professionnel",
    bio: "Humoriste, auteur et réalisateur. Le jour 1, il anime la masterclass et te coache sur ton propre sketch : tu joues devant lui, il te corrige sur ton texte.",
    filmographie: [
      "60 minutes",
      "Dragon",
      "Nous trois ou rien",
      "Mauvaises Herbes",
      "Brutus vs César",
    ],
    photoUrl: "/images/intervenants/kheiron.webp",
    photoMimeType: "image/webp",
  },
  {
    slug: "phil-darwin",
    nom: "Phil Darwin",
    role: "Humoriste, comédien et formateur",
    parrain: false,
    categorie: "formateur",
    bio: "Artiste franco-congolais, il évolue depuis plus de 20 ans dans le stand-up, le théâtre et les médias. Il a joué à l'Olympia, au Zénith de Paris et à La Cigale, et dans des festivals en Europe, en Afrique et en Amérique du Nord. Chroniqueur radio et comédien, il joue dans Mayouya de Claudia Yoka, présenté à Cannes en 2022. Il transmet le métier : écriture humoristique, interprétation, rythme comique et présence scénique. Pendant les 4 jours, il t'accompagne jusqu'à ton sketch devant le public.",
    filmographie: ["Mayouya"],
    photoUrl: "/images/intervenants/phil-darwin.webp",
    photoMimeType: "image/webp",
  },
  {
    slug: "formateur-mystere",
    nom: "Formateur mystère",
    role: "Formateur",
    parrain: false,
    categorie: "formateur",
    bio: "Son nom reste secret pour l'instant : il sera dévoilé prochainement. Les premiers inscrits le découvriront avant tout le monde.",
    filmographie: [],
    photoUrl: "/images/intervenants/formateur-mystere.webp",
    photoMimeType: "image/webp",
  },
];

export const defaultFormations: FormationData[] = formationsCatalog.map((f) => ({
  ...f,
  active: isFormationActive(f.slug),
}));

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

export type FinancementDispositif = {
  key: FinancementKey;
  titre: string;
  description: string;
  public: string;
  etapes: string[];
};

/** Conservé pour réactivation : n'apparaît pas tant que PUBLIC_FINANCEMENT_KEYS est vide. */
export const defaultFinancement: FinancementDispositif[] = [
  {
    key: "afdas",
    titre: "AFDAS",
    description: "Financement pour les intermittents du spectacle.",
    public: "Intermittents du spectacle (comédiens, techniciens…)",
    etapes: [
      "Vérifier ton éligibilité sur le site AFDAS",
      "Choisir ta formation Cinémergence",
      "Monter ton dossier avec notre accompagnement",
    ],
  },
  {
    key: "opco",
    titre: "OPCO",
    description: "Prise en charge par l'organisme de compétences de ton employeur.",
    public: "Salariés en poste ou en reconversion",
    etapes: [
      "Identifier ton OPCO (via ton employeur ou France Travail)",
      "Obtenir l'accord de ton employeur si tu es salarié",
      "Nous contacter pour le devis et la convention",
    ],
  },
  {
    key: "cpf",
    titre: "CPF",
    description: "Mon Compte Formation — droits acquis tout au long de ta carrière.",
    public: "Salariés, demandeurs d'emploi, indépendants",
    etapes: [
      "Vérifier tes droits sur moncompteformation.gouv.fr",
      "Choisir ta formation Cinémergence",
      "Valider le dossier avec notre accompagnement",
    ],
  },
  {
    key: "france-travail",
    titre: "France Travail",
    description: "Aide à la formation pour les demandeurs d'emploi.",
    public: "Demandeurs d'emploi",
    etapes: [
      "En parler à ton conseiller France Travail",
      "Choisir la formation adaptée à ton projet",
      "Monter le dossier AIF ou équivalent",
    ],
  },
];

export const financementGuide: Record<string, FinancementKey[]> = {
  debutant: ["france-travail", "opco"],
  reconversion: ["opco", "france-travail"],
  intermittent: ["afdas"],
  salarie: ["opco"],
};

export const defaultLegal = {
  mentionsLegales: `
Cinémergence — Association loi 1901
Siège : Paris, Île-de-France
Email : contact@cinemergence.fr
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
Vos droits : accès, rectification, suppression, opposition — contactez contact@cinemergence.fr.
  `.trim(),
  cgv: `
Conditions générales de vente — Cinémergence

Les présentes CGV s'appliquent aux formations proposées par Cinémergence, association loi 1901, NDA 117 888 658 78.

Inscription : toute inscription est confirmée par email après validation du paiement.
Annulation : conditions d'annulation communiquées lors de l'inscription.
Réclamations : contact@cinemergence.fr
  `.trim(),
};
