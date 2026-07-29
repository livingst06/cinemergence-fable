import type { FormationData, FaqItem, FinancementKey, ProgrammeJour } from "./formation-types";
import { formationsCatalog } from "./formations-catalog";

export type { FormationData, FaqItem, FinancementKey, ProgrammeJour } from "./formation-types";
export { formationPath, formationLivrableLabel } from "./formation-types";

/** @deprecated Use ProgrammeJour — kept for seed/CMS compatibility aliases. */
export type Module = ProgrammeJour;

export type IntervenantData = {
  slug: string;
  nom: string;
  role: string;
  parrain: boolean;
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
  email: "cinemergence.paris@gmail.com",
  phone: "+33 7 69 18 55 94",
  city: "Paris, Île-de-France",
  nda: "117 888 658 78",
  qualiopiObtained: false,
  qualiopiLabel: "Certification Qualiopi en cours d'obtention",
  partnerName: "Bakelite Films",
  partnerRole: "Production partenaire",
  instagramUrl: "https://www.instagram.com/cinemergence.paris",
} as const;

export const defaultIntervenants: IntervenantData[] = [
  {
    slug: "bibi-naceri",
    nom: "Bibi Naceri",
    role: "Acteur, réalisateur & scénariste",
    parrain: true,
    bio: "Parrain de la 1ère édition. Acteur, réalisateur et scénariste reconnu, il intervient lors de sessions de direction d'acteur sur le texte, l'émotion et la justesse du jeu.",
    filmographie: ["Banlieue 13", "Taken", "District 13"],
  },
  {
    slug: "salim-kechiouche",
    nom: "Salim Kéchiouche",
    role: "Acteur",
    parrain: false,
    bio: "Intervenant d'exception. Il accompagne les stagiaires sur le plateau avec une direction d'acteur exigeante et bienveillante.",
    filmographie: ["L'Esquive", "3 Hearts", "Le Grand Jeu"],
  },
  {
    slug: "edouard-montoute",
    nom: "Édouard Montoute",
    role: "Acteur",
    parrain: false,
    bio: "Intervenant d'exception. Comédien polyvalent, il partage son expérience du jeu face caméra en conditions réelles de tournage.",
    filmographie: ["Neuilly sa mère", "Les Kaïra", "La Môme"],
  },
  {
    slug: "karina-testa",
    nom: "Karina Testa",
    role: "Actrice",
    parrain: false,
    bio: "Actrice engagée, présente sur les plateaux Cinémergence. Elle intervient sur le jeu d'acteur et la mise en scène avec une attention particulière à l'authenticité.",
    filmographie: ["Le Tombeau des Anges", "La Môme", "Polisse"],
  },
];

export const defaultFormations: FormationData[] = formationsCatalog;

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
    titre: "CPF — Mon Compte Formation",
    description: "Utilise tes droits acquis sur Mon Compte Formation.",
    public: "Toute personne ayant travaillé en France",
    etapes: [
      "Connecte-toi sur moncompteformation.gouv.fr",
      "Recherche la formation Cinémergence",
      "Inscris-toi ou contacte-nous pour finaliser",
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
  debutant: ["cpf", "france-travail", "opco"],
  reconversion: ["cpf", "opco", "france-travail"],
  intermittent: ["afdas", "cpf"],
  salarie: ["opco", "cpf"],
};

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
Financement : les formations peuvent être prises en charge par AFDAS, OPCO, CPF ou France Travail selon éligibilité.
Réclamations : cinemergence.paris@gmail.com
  `.trim(),
};
