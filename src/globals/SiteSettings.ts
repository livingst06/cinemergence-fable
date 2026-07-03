import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Paramètres du site",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      defaultValue: "Cinémergence",
    },
    {
      name: "tagline",
      type: "text",
      required: true,
      defaultValue: "Le cinéma, c'est pour toi.",
    },
    {
      name: "description",
      type: "textarea",
      required: true,
    },
    {
      name: "url",
      type: "text",
      required: true,
    },
    {
      name: "email",
      type: "email",
      required: true,
    },
    {
      name: "nda",
      type: "text",
      required: true,
    },
    {
      name: "qualiopiObtained",
      type: "checkbox",
      defaultValue: false,
      label: "Certification Qualiopi obtenue",
    },
    {
      name: "qualiopiLabel",
      type: "text",
      defaultValue: "Certification Qualiopi en cours d'obtention",
    },
    {
      name: "partnerName",
      type: "text",
      defaultValue: "Bakelite Films",
    },
    {
      name: "instagramUrl",
      type: "text",
    },
  ],
};
