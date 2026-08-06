import type { CollectionConfig } from "payload";

export const INSCRIPTION_STATUSES = [
  { label: "En cours d'instruction", value: "en_instruction" },
  { label: "Validée", value: "validee" },
  { label: "Refusée", value: "refusee" },
  { label: "En attente de pièce complémentaire", value: "pieces_complementaires" },
  // Legacy (migration douce)
  { label: "Demande (legacy)", value: "demande" },
  { label: "Inscrit (legacy)", value: "inscrit" },
  { label: "Annulé (legacy)", value: "annule" },
] as const;

export type InscriptionStatusValue =
  (typeof INSCRIPTION_STATUSES)[number]["value"];

export const Inscriptions: CollectionConfig = {
  slug: "inscriptions",
  admin: {
    useAsTitle: "id",
    defaultColumns: ["user", "formation", "status", "updatedAt"],
    description:
      "Demandes d'inscription stagiaires — valider, refuser ou demander des pièces.",
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
      defaultValue: "en_instruction",
      options: [...INSCRIPTION_STATUSES],
    },
    {
      name: "commentaireAdmin",
      type: "textarea",
      label: "Commentaire administrateur",
      admin: {
        description: "Visible par le stagiaire en cas de refus ou de pièces demandées.",
      },
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
