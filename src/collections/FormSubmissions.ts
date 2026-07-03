import type { CollectionConfig } from "payload";

export const FormSubmissions: CollectionConfig = {
  slug: "form-submissions",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["type", "email", "createdAt"],
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Contact général", value: "contact" },
        { label: "Inscription formation", value: "inscription" },
        { label: "Demande financement", value: "financement" },
        { label: "Newsletter", value: "newsletter" },
      ],
    },
    {
      name: "email",
      type: "email",
      required: true,
    },
    {
      name: "nom",
      type: "text",
    },
    {
      name: "telephone",
      type: "text",
    },
    {
      name: "message",
      type: "textarea",
    },
    {
      name: "formationSlug",
      type: "text",
    },
    {
      name: "profilFinancement",
      type: "text",
    },
    {
      name: "payload",
      type: "json",
    },
  ],
};
