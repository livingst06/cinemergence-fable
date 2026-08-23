import type { CollectionConfig } from "payload";

import { SALON_POST_MAX_LENGTH } from "@/lib/salon-constants";

/**
 * Message posté dans le salon d’une session.
 */
export const SalonPosts: CollectionConfig = {
  slug: "salon-posts",
  labels: {
    singular: "Post du salon",
    plural: "Posts des salons",
  },
  admin: {
    useAsTitle: "id",
    defaultColumns: ["salon", "author", "createdAt"],
    description: "Messages du salon : élèves inscrits et staff de la session.",
  },
  access: {
    read: ({ req }) => req.user?.role === "admin",
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "salon",
      type: "relationship",
      relationTo: "session-salons",
      required: true,
      index: true,
      label: "Salon",
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
      label: "Auteur",
    },
    {
      name: "body",
      type: "textarea",
      required: true,
      maxLength: SALON_POST_MAX_LENGTH,
      label: "Message",
    },
  ],
};
