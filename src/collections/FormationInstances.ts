import type { CollectionConfig } from "payload";

/**
 * Session datée d’une formation (plusieurs instances possibles par formation).
 */
export const FormationInstances: CollectionConfig = {
  slug: "formation-instances",
  labels: {
    singular: "Instance de formation",
    plural: "Instances de formation",
  },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "formation", "dateDebut", "dateFin", "placesOffertes", "active"],
    description:
      "Sessions datées : une formation peut avoir plusieurs instances à des dates différentes.",
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "formation",
      type: "relationship",
      relationTo: "formations",
      required: true,
      index: true,
    },
    {
      name: "label",
      type: "text",
      label: "Libellé (optionnel)",
      admin: {
        description: "Ex. « Session automne 2026 ». Sinon les dates servent de titre.",
      },
    },
    {
      name: "dateDebut",
      type: "date",
      required: true,
      label: "Date de début",
      admin: {
        date: { pickerAppearance: "dayOnly" },
      },
      index: true,
    },
    {
      name: "dateFin",
      type: "date",
      required: true,
      label: "Date de fin",
      admin: {
        date: { pickerAppearance: "dayOnly" },
      },
    },
    {
      name: "placesOffertes",
      type: "number",
      required: true,
      min: 0,
      label: "Places offertes",
      admin: {
        description: "Capacité de cette session uniquement.",
      },
    },
    {
      name: "tarifEuros",
      type: "number",
      label: "Tarif (euros) — optionnel",
      admin: {
        description:
          "Si vide, le tarif de la formation parente est utilisé pour Stripe.",
      },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      label: "Ouverte aux inscriptions",
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.dateDebut && data?.dateFin && !data.label) {
          const d1 = String(data.dateDebut).slice(0, 10);
          const d2 = String(data.dateFin).slice(0, 10);
          data.label = `Session ${d1} → ${d2}`;
        }
        return data;
      },
    ],
  },
};
