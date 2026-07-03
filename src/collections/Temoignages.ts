import type { CollectionConfig } from "payload";

export const Temoignages: CollectionConfig = {
  slug: "temoignages",
  admin: {
    useAsTitle: "auteur",
  },
  fields: [
    {
      name: "profil",
      type: "select",
      required: true,
      options: [
        { label: "Débutant", value: "debutant" },
        { label: "Reconversion", value: "reconversion" },
        { label: "Intermittent", value: "intermittent" },
      ],
    },
    {
      name: "quote",
      type: "textarea",
      required: true,
    },
    {
      name: "auteur",
      type: "text",
      required: true,
    },
    {
      name: "formation",
      type: "text",
    },
  ],
};
