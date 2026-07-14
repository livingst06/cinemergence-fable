import type { CollectionConfig } from "payload";

import { clerkStrategy } from "@/lib/clerk-strategy";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    disableLocalStrategy: true,
    strategies: [clerkStrategy],
  },
  access: {
    admin: ({ req }) => req.user?.role === "admin",
  },
  admin: {
    useAsTitle: "email",
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "clerkId",
      type: "text",
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "role",
      type: "select",
      defaultValue: "stagiaire",
      required: true,
      options: [
        { label: "Admin", value: "admin" },
        { label: "Stagiaire", value: "stagiaire" },
      ],
    },
  ],
};
