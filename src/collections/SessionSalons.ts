import type { CollectionConfig } from "payload";

/**
 * Salon de discussion 1:1 avec une session de formation.
 */
export const SessionSalons: CollectionConfig = {
  slug: "session-salons",
  labels: {
    singular: "Salon de discussion",
    plural: "Salons de discussion",
  },
  admin: {
    useAsTitle: "id",
    defaultColumns: ["session", "createdAt"],
    description:
      "Un salon par session. Les stagiaires inscrits (payés) y discutent depuis Mes réservations.",
  },
  access: {
    read: ({ req }) => req.user?.role === "admin",
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "session",
      type: "relationship",
      relationTo: "formation-sessions",
      required: true,
      unique: true,
      index: true,
      label: "Session",
    },
  ],
};
