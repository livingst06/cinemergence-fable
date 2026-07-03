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
    },
    {
      name: "titre",
      type: "text",
      required: true,
    },
    {
      name: "titreCourt",
      type: "text",
      required: true,
    },
    {
      name: "prioritaire",
      type: "checkbox",
      defaultValue: false,
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
    },
    {
      name: "intro",
      type: "textarea",
      required: true,
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
      name: "programme",
      type: "array",
      required: true,
      fields: [
        { name: "titre", type: "text", required: true },
        { name: "detail", type: "textarea", required: true },
      ],
    },
    {
      name: "duree",
      type: "text",
      required: true,
    },
    {
      name: "format",
      type: "text",
      required: true,
    },
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
