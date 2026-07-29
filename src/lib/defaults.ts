import type { FormationData, FaqItem, FinancementKey, ProgrammeJour } from "./formation-types";

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

export const defaultFormations: FormationData[] = [
  {
    slug: "formation-jouer-face-camera",
    pole: "Jeu",
    titre: "Tourner sa bande démo cinéma",
    titreCourt: "Bande démo cinéma",
    sousTitre: "Jeu face caméra et tournage professionnel — 2 jours",
    prioritaire: true,
    accroche:
      "Une formation qui te confronte aux conditions réelles d'un tournage, pour passer du niveau amateur au niveau professionnel.",
    publicCible: "Comédiens débutants et confirmés — tous niveaux",
    livrable: "Deux scènes tournées, prêtes pour ta bande démo",
    livrables: ["Deux scènes tournées et montées, prêtes pour ta bande démo"],
    intro:
      "Cette formation a été conçue pour offrir à chaque stagiaire une expérience concrète, formatrice et valorisante, tout en respectant les standards du cinéma professionnel.",
    contexteFinalite:
      "La bande démo est le premier outil d'employabilité du comédien. Cette formation professionnalise le jeu face caméra et livre des scènes exploitables pour les castings.",
    pourQui:
      "Pour tous les comédiens, même ceux qui débutent. Nous rendons la qualité de tournage accessible à tous, encadrés comme de vrais plateaux.",
    objectifs: [
      "Travailler le texte, l'émotion et la justesse du jeu",
      "Adapter son jeu aux exigences du tournage",
      "Repartir avec deux scènes montées, prêtes à intégrer à sa bande démo",
    ],
    competences: [
      "Présence face caméra",
      "Direction d'acteur et intentions",
      "Jeu en conditions de plateau",
    ],
    programme: [
      {
        jour: 1,
        titre: "Répétitions et direction d'acteur",
        objectifJournee: "Entrer dans le rôle, comprendre la scène, se préparer.",
        detail:
          "Préparation artistique, session de direction d'acteur avec le parrain, travail des scènes et brief technique.",
        sequences: [
          { titre: "Accueil & positionnement", duree: "1 h" },
          { titre: "Direction d'acteur & travail des scènes", duree: "4 h" },
          { titre: "Brief technique", duree: "2 h" },
        ],
      },
      {
        jour: 2,
        titre: "Tournage professionnel",
        objectifJournee: "Vivre un vrai tournage et repartir avec des scènes montées.",
        detail:
          "Chaque stagiaire tourne deux scènes dans des décors réels. Équipe technique complète pour garantir un rendu cinéma.",
        sequences: [
          { titre: "Mise en place plateau", duree: "1 h" },
          { titre: "Tournage des scènes", duree: "5 h" },
          { titre: "Debrief", duree: "1 h" },
        ],
      },
    ],
    duree: "2 jours (week-end)",
    dureeHeures: 14,
    dureeJours: 2,
    format: "Formation intensive sur plateau",
    modalite: "Présentiel",
    effectifMax: 12,
    prerequis: "Aucun prérequis ; entretien de positionnement préalable",
    lieu: "Paris — plateau cinéma professionnel",
    delaiAcces: "Inscription à finaliser 6 à 8 semaines avant le début",
    tarif: "600 €",
    financements: ["afdas", "opco", "cpf", "france-travail"],
    methodesPedagogiques: [
      "Pédagogie active : répétitions et mises en situation filmées",
      "Direction d'acteur individualisée",
      "Retour vidéo et suivi sur plateau",
    ],
    moyensTechniques: [
      "Caméras RED ou ARRI",
      "Équipe technique complète",
      "Décors réels",
    ],
    encadrement:
      "Formation animée par des comédiens et réalisateurs professionnels en activité.",
    evaluation:
      "Évaluation continue sur les prises ; bilan en fin de formation ; attestation de fin de formation.",
    accessibilite:
      "Locaux et parcours adaptables aux personnes en situation de handicap — référent handicap à contacter.",
    modalitesAccesFinancement:
      "Éligible AFDAS, OPCO, CPF et France Travail selon profil. Accompagnement au montage du dossier.",
    intervenants: ["bibi-naceri", "edouard-montoute", "salim-kechiouche", "karina-testa"],
    faq: [
      {
        q: "Faut-il avoir déjà joué ?",
        r: "Non. La formation est ouverte à tous les comédiens, même ceux qui débutent.",
      },
      {
        q: "Qu'est-ce que je repars concrètement ?",
        r: "Deux scènes tournées, comme si elles étaient extraites d'un film, prêtes à être envoyées à un agent ou à un directeur de casting.",
      },
      {
        q: "Quelle est l'offre à 750 € ?",
        r: "La formation complète et la bande démo, plus un shooting photobook professionnel incluant 4 portraits et 2 plein pieds.",
      },
    ],
    metaTitle: "Formation bande démo cinéma Paris — Cinémergence",
    metaDescription:
      "Formation bande démo cinéma à Paris : jeu face caméra et tournage professionnel sur 2 jours. École de formation Cinémergence.",
  },
  {
    slug: "formation-realiser-court-metrage",
    pole: "Réalisation",
    titre: "Réaliser son court-métrage de A à Z",
    titreCourt: "Réaliser son court-métrage",
    sousTitre: "De l'idée au film monté",
    prioritaire: true,
    accroche:
      "De l'idée au film monté : tu réalises ton court-métrage avec une équipe pro et tu repars avec un livrable finalisé.",
    publicCible: "Créateurs, passionnés, reconversion",
    livrable: "Un court-métrage monté et finalisé",
    livrables: ["Un court-métrage monté et finalisé"],
    intro:
      "Tu as une histoire à raconter ? On t'accompagne pour la mener jusqu'au bout : écriture, préparation, tournage, montage.",
    contexteFinalite:
      "Former le stagiaire à conduire un projet de court-métrage de bout en bout, en conditions professionnelles.",
    pourQui:
      "Pour les passionnés de cinéma, les créateurs en herbe et les personnes en reconversion qui veulent produire un premier film sérieux.",
    objectifs: [
      "Structurer et préparer un projet de court-métrage",
      "Diriger un tournage en conditions professionnelles",
      "Finaliser un film monté prêt à être diffusé",
    ],
    competences: [
      "Écriture et préparation",
      "Direction de tournage",
      "Post-production",
    ],
    programme: [
      { jour: 1, titre: "Écriture et préparation", detail: "Développement du scénario, découpage, intention de mise en scène." },
      { jour: 2, titre: "Préproduction", detail: "Casting, repérages, organisation du plateau." },
      { jour: 3, titre: "Tournage", detail: "Direction d'acteurs et d'équipe technique." },
      { jour: 4, titre: "Post-production", detail: "Montage et finalisation du film." },
    ],
    duree: "À confirmer",
    format: "Plusieurs sessions",
    modalite: "Présentiel",
    tarif: null,
    financements: ["afdas", "opco", "cpf", "france-travail"],
    intervenants: ["bibi-naceri"],
    faq: [
      { q: "Faut-il déjà avoir un scénario ?", r: "Non. On peut partir d'une idée et la développer ensemble." },
      { q: "Le film m'appartient-il ?", r: "Oui. Tu repars avec ton court-métrage finalisé." },
    ],
    metaTitle: "Formation réalisation court-métrage Paris — Cinémergence",
    metaDescription:
      "Réalise ton court-métrage de A à Z à Paris. Formation pratique, encadrement pro, film finalisé en sortie. Finançable AFDAS, OPCO, CPF.",
  },
  {
    slug: "formation-ecriture-scenario",
    pole: "Écriture",
    titre: "Écrire son court-métrage",
    titreCourt: "Écrire son court-métrage",
    prioritaire: false,
    accroche: "Tu repars avec un scénario de court-métrage terminé, structuré et prêt à être tourné.",
    publicCible: "Débutants, associations, écoles",
    livrable: "Un scénario de court-métrage terminé",
    livrables: ["Un scénario de court-métrage terminé"],
    intro: "De la première idée au scénario final : on t'accompagne pas à pas dans l'écriture cinématographique.",
    pourQui: "Pour les débutants complets comme pour ceux qui ont déjà des idées mais ne savent pas comment les structurer.",
    objectifs: [
      "Maîtriser la structure narrative d'un court-métrage",
      "Écrire des dialogues crédibles",
      "Produire un scénario exploitable",
    ],
    programme: [
      { titre: "Trouver son histoire", detail: "Idée, thème, personnages." },
      { titre: "Structure", detail: "Actes, conflit, arc narratif." },
      { titre: "Écriture", detail: "Dialogues, descriptions, format scénario." },
      { titre: "Réécriture", detail: "Retours et finalisation." },
    ],
    duree: "À confirmer",
    format: "Plusieurs sessions",
    modalite: "Présentiel",
    tarif: null,
    financements: ["opco", "cpf", "france-travail"],
    intervenants: ["bibi-naceri"],
    faq: [
      { q: "Faut-il savoir écrire ?", r: "Non. On t'apprend la méthode, pas besoin d'expérience préalable." },
    ],
    metaTitle: "Formation écriture scénario court-métrage Paris — Cinémergence",
    metaDescription: "Apprends à écrire un scénario de court-métrage à Paris. Formation accessible, livrable concret.",
  },
  {
    slug: "formation-bande-demo",
    pole: "Jeu",
    titre: "Tourner sa bande démo professionnelle",
    titreCourt: "Bande démo pro",
    prioritaire: false,
    accroche:
      "Deux scènes tournées en conditions professionnelles, montées et prêtes à envoyer aux castings.",
    publicCible: "Comédiens, intermittents",
    livrable: "Deux scènes montées pour bande démo",
    livrables: ["Deux scènes montées pour bande démo"],
    intro:
      "Nous tournons uniquement avec des caméras RED ou ARRI — le standard du cinéma et des plateformes. Une image conforme aux exigences du marché, exploitable par agents et directeurs de casting.",
    pourQui: "Comédiens professionnels ou en devenir, intermittents du spectacle.",
    objectifs: [
      "Tourner deux scènes en conditions réelles de plateau",
      "Bénéficier d'une direction d'acteur exigeante",
      "Obtenir des images exploitables pour les castings",
    ],
    programme: [
      { titre: "Préparation", detail: "Travail des scènes, intentions, présence face caméra." },
      { titre: "Tournage RED / ARRI", detail: "Deux scènes filmées avec équipe technique complète." },
      { titre: "Montage", detail: "Scènes montées, prêtes à intégrer à ta bande démo." },
    ],
    duree: "2 jours",
    dureeHeures: 14,
    dureeJours: 2,
    format: "Formation intensive",
    modalite: "Présentiel",
    tarif: "600 €",
    financements: ["afdas", "opco"],
    intervenants: ["edouard-montoute", "karina-testa"],
    faq: [
      {
        q: "Puis-je financer avec l'AFDAS ?",
        r: "Oui, la formation est éligible au financement AFDAS pour les intermittents.",
      },
      {
        q: "Quel matériel utilisez-vous ?",
        r: "Nous tournons uniquement avec des caméras RED ou ARRI, standard des plateaux professionnels.",
      },
    ],
    metaTitle: "Bande démo professionnelle Paris — Cinémergence",
    metaDescription:
      "Tourne ta bande démo avec des caméras RED ou ARRI à Paris. Formation encadrée par des acteurs pros. À partir de 600 €.",
  },
  {
    slug: "formation-camera-cinema",
    pole: "Technique",
    titre: "Maîtriser une caméra de cinéma pro",
    titreCourt: "Caméra de cinéma pro",
    prioritaire: false,
    accroche: "Tu repars avec une scène tournée et montée, maîtrisant les bases de la caméra professionnelle.",
    publicCible: "Jeunes, passionnés technique",
    livrable: "1 scène tournée et montée",
    livrables: ["1 scène tournée et montée"],
    intro: "Caméra, lumière, cadrage, mouvement : tu apprends en faisant, sur du matériel professionnel.",
    pourQui: "Passionnés de technique image, jeunes en reconversion, futurs cadreurs ou chefs opérateurs.",
    objectifs: [
      "Comprendre les réglages d'une caméra cinéma",
      "Cadrer et filmer une scène en conditions réelles",
      "Repartir avec une scène montée",
    ],
    programme: [
      { titre: "Matériel", detail: "Présentation et prise en main de la caméra pro." },
      { titre: "Cadrage", detail: "Composition, focale, profondeur de champ." },
      { titre: "Lumière", detail: "Bases de l'éclairage cinématographique." },
      { titre: "Tournage et montage", detail: "Mise en pratique complète." },
    ],
    duree: "À confirmer",
    format: "Formation intensive",
    modalite: "Présentiel",
    tarif: null,
    financements: ["afdas", "opco", "cpf"],
    intervenants: [],
    faq: [
      { q: "Faut-il avoir de l'expérience technique ?", r: "Non. On part des bases." },
    ],
    metaTitle: "Formation caméra cinéma professionnelle Paris — Cinémergence",
    metaDescription: "Maîtrise une caméra de cinéma pro à Paris. Formation pratique, scène tournée et montée en sortie.",
  },
  {
    slug: "formation-production-film",
    pole: "Production",
    titre: "Produire un film indépendant",
    titreCourt: "Production indépendante",
    prioritaire: false,
    accroche: "Plan de production et dossier de financement pour lancer ton projet de film indépendant.",
    publicCible: "Créateurs indépendants",
    livrable: "Plan de prod + dossier financement",
    livrables: ["Plan de production", "Dossier de financement"],
    intro: "Tu as un projet de film ? On t'aide à le structurer, le budgétiser et le présenter aux financeurs.",
    pourQui: "Réalisateurs, producteurs en herbe, créateurs indépendants avec un projet concret.",
    objectifs: [
      "Construire un plan de production réaliste",
      "Établir un budget prévisionnel",
      "Rédiger un dossier de financement convaincant",
    ],
    programme: [
      { titre: "Analyse du projet", detail: "Faisabilité, calendrier, équipe." },
      { titre: "Budget", detail: "Postes de dépenses, optimisation, contingences." },
      { titre: "Financement", detail: "Dispositifs, aides, coproduction." },
      { titre: "Dossier", detail: "Rédaction et présentation du dossier." },
    ],
    duree: "À confirmer",
    format: "Plusieurs sessions",
    modalite: "Présentiel",
    tarif: null,
    financements: ["opco", "cpf"],
    intervenants: ["bibi-naceri"],
    faq: [
      { q: "Faut-il avoir un scénario terminé ?", r: "Un synopsis ou un traitement suffit pour démarrer." },
    ],
    metaTitle: "Formation production film indépendant Paris — Cinémergence",
    metaDescription: "Apprends à produire un film indépendant à Paris. Plan de prod et dossier de financement en sortie.",
  },
];

export const defaultTemoignages: TemoignageData[] = [
  {
    profil: "debutant",
    quote:
      "Avant la formation, je jouais surtout en théâtre. J'avais du mal avec la caméra. J'ai compris comment gérer mon regard et mon énergie en gros plan. Les images obtenues m'ont permis d'envoyer une bande démo propre aux castings.",
    auteur: "Camille, 27 ans",
    formation: "Bande démo cinéma",
  },
  {
    profil: "intermittent",
    quote:
      "Le travail est direct. Pas de blabla. On répète, on tourne, on corrige. J'ai surtout progressé sur la justesse et l'écoute. Ça m'a aidé à me sentir plus solide en audition.",
    auteur: "Yanis, 32 ans",
    formation: "Bande démo cinéma",
  },
  {
    profil: "debutant",
    quote:
      "Je n'avais aucune bande démo. En deux jours, j'ai travaillé des scènes exigeantes et obtenu des images exploitables. Le regard d'un réalisateur change vraiment la façon d'aborder le jeu.",
    auteur: "Sarah, 24 ans",
    formation: "Bande démo cinéma",
  },
  {
    profil: "reconversion",
    quote:
      "Ce que j'ai apprécié : les retours précis et concrets. On comprend vite ce qui fonctionne et ce qui sonne faux. Ça remet les idées en place.",
    auteur: "Mehdi, 29 ans",
    formation: "Bande démo cinéma",
  },
  {
    profil: "intermittent",
    quote:
      "Le cadre est professionnel. On se sent considéré comme un acteur, pas comme un élève. J'ai gagné en confiance face caméra.",
    auteur: "Laura, 35 ans",
    formation: "Bande démo cinéma",
  },
  {
    profil: "debutant",
    quote:
      "Je pensais être prêt pour les castings. La formation m'a montré mes faiblesses. Ça m'a forcé à travailler plus finement. Résultat : des images plus crédibles.",
    auteur: "Thomas, 22 ans",
    formation: "Bande démo cinéma",
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
