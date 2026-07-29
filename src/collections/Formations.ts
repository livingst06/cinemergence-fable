import type { CollectionConfig } from "payload";

const financementOptions = [
  { label: "AFDAS", value: "afdas" },
  { label: "OPCO", value: "opco" },
  { label: "CPF", value: "cpf" },
  { label: "France Travail", value: "france-travail" },
];

export const Formations: CollectionConfig = {
  slug: "formations",
  admin: {
    useAsTitle: "titre",
    defaultColumns: ["titre", "pole", "prioritaire", "updatedAt"],
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Segment d'URL, ex. formation-jouer-face-camera",
      },
    },
    {
      name: "pole",
      type: "text",
      required: true,
      admin: {
        description: "Pôle catalogue : Jeu, Réalisation, Technique, Écriture, Production, Entreprise…",
      },
    },
    {
      name: "titre",
      type: "text",
      required: true,
      label: "Intitulé",
    },
    {
      name: "titreCourt",
      type: "text",
      required: true,
    },
    {
      name: "sousTitre",
      type: "text",
      admin: {
        description: "Sous-titre sous l'intitulé (fiche)",
      },
    },
    {
      name: "prioritaire",
      type: "checkbox",
      defaultValue: false,
      label: "À la une",
    },
    {
      name: "audience",
      type: "select",
      required: true,
      defaultValue: "intermittent",
      options: [
        { label: "Intermittents / audiovisuel", value: "intermittent" },
        { label: "Entreprise", value: "entreprise" },
      ],
    },
    {
      name: "accroche",
      type: "textarea",
      required: true,
    },
    {
      name: "publicCible",
      type: "text",
      required: true,
    },
    {
      name: "livrable",
      type: "text",
      required: true,
      admin: {
        description: "Libellé court pour les cartes",
      },
    },
    {
      name: "livrables",
      type: "array",
      fields: [{ name: "item", type: "text", required: true }],
    },
    {
      name: "intro",
      type: "textarea",
      required: true,
    },
    {
      name: "contexteFinalite",
      type: "textarea",
      label: "Contexte et finalité professionnelle",
    },
    {
      name: "pourQui",
      type: "textarea",
      required: true,
    },
    {
      name: "objectifs",
      type: "array",
      required: true,
      fields: [{ name: "item", type: "text", required: true }],
    },
    {
      name: "competences",
      type: "array",
      label: "Compétences visées",
      fields: [{ name: "item", type: "text", required: true }],
    },
    {
      name: "programme",
      type: "array",
      required: true,
      fields: [
        { name: "jour", type: "number", admin: { description: "N° du jour (optionnel)" } },
        { name: "titre", type: "text", required: true },
        { name: "objectifJournee", type: "textarea" },
        { name: "detail", type: "textarea" },
        {
          name: "sequences",
          type: "array",
          fields: [
            { name: "titre", type: "text", required: true },
            { name: "duree", type: "text" },
            { name: "detail", type: "textarea" },
          ],
        },
      ],
    },
    {
      name: "duree",
      type: "text",
      required: true,
      admin: { description: "Libellé affiché, ex. 35 heures — 5 journées" },
    },
    { name: "dureeHeures", type: "number" },
    { name: "dureeJours", type: "number" },
    {
      name: "format",
      type: "text",
      required: true,
    },
    {
      name: "modalite",
      type: "text",
      defaultValue: "Présentiel",
    },
    { name: "effectifMax", type: "number" },
    { name: "prerequis", type: "textarea" },
    { name: "lieu", type: "text" },
    { name: "delaiAcces", type: "text" },
    {
      name: "tarif",
      type: "text",
      admin: {
        description: "Laisser vide si tarif à confirmer",
      },
    },
    {
      name: "financements",
      type: "select",
      hasMany: true,
      options: financementOptions,
    },
    {
      name: "methodesPedagogiques",
      type: "array",
      fields: [{ name: "item", type: "text", required: true }],
    },
    {
      name: "moyensTechniques",
      type: "array",
      fields: [{ name: "item", type: "text", required: true }],
    },
    { name: "encadrement", type: "textarea" },
    { name: "evaluation", type: "textarea", label: "Modalités d'évaluation et de suivi" },
    { name: "accessibilite", type: "textarea" },
    {
      name: "modalitesAccesFinancement",
      type: "textarea",
      label: "Modalités d'accès et financement",
    },
    {
      name: "intervenants",
      type: "relationship",
      relationTo: "intervenants",
      hasMany: true,
    },
    {
      name: "faq",
      type: "array",
      fields: [
        { name: "q", type: "text", required: true },
        { name: "r", type: "textarea", required: true },
      ],
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "metaTitle",
      type: "text",
      required: true,
    },
    {
      name: "metaDescription",
      type: "textarea",
      required: true,
    },
  ],
};

export { financementOptions };
