import type { CollectionConfig } from "payload";

export const Intervenants: CollectionConfig = {
  slug: "intervenants",
  admin: {
    useAsTitle: "nom",
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "nom",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "text",
      required: true,
    },
    {
      name: "parrain",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Parrain de l'association (ex. Bibi Naceri)",
      },
    },
    {
      name: "bio",
      type: "textarea",
      required: true,
    },
    {
      name: "filmographie",
      type: "array",
      fields: [{ name: "titre", type: "text", required: true }],
    },
    {
      name: "formations",
      type: "relationship",
      relationTo: "formations",
      hasMany: true,
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
    },
  ],
};
