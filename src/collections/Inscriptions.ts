import type { CollectionConfig } from "payload";

export const Inscriptions: CollectionConfig = {
  slug: "inscriptions",
  admin: {
    useAsTitle: "id",
    defaultColumns: ["user", "formation", "status", "updatedAt"],
    description: "Inscriptions stagiaires — passe en « inscrit » pour afficher sur Mon compte.",
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === "admin") return true;
      if (!req.user) return false;
      return { user: { equals: req.user.id } };
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
    {
      name: "formation",
      type: "relationship",
      relationTo: "formations",
      required: true,
      index: true,
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "demande",
      options: [
        { label: "Demande", value: "demande" },
        { label: "Inscrit", value: "inscrit" },
        { label: "Annulé", value: "annule" },
      ],
    },
    {
      name: "codeParrainage",
      type: "text",
      label: "Code parrainage",
    },
    {
      name: "message",
      type: "textarea",
    },
  ],
};
