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
      defaultValue: "Formations cinéma en conditions réelles de plateau, à Paris.",
    },
    {
      name: "description",
      type: "textarea",
      required: true,
      defaultValue:
        "Cinémergence, école de formation cinéma à Paris. Formations professionnelles pour comédiens, techniciens et entreprises — encadrées comme de vrais plateaux.",
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
      defaultValue: true,
      label: "Certification Qualiopi obtenue",
    },
    {
      name: "qualiopiLabel",
      type: "text",
      defaultValue: "Organisme certifié Qualiopi",
      admin: {
        description: "Libellé affiché (ex. Organisme certifié Qualiopi)",
      },
    },
    {
      name: "partnerName",
      type: "text",
      defaultValue: "Bakelite Films",
    },
    {
      name: "instagramUrl",
      type: "text",
      defaultValue: "https://www.instagram.com/cinemergence",
      admin: {
        description: "URL du compte Instagram officiel",
      },
    },
    {
      name: "founderPhoto",
      type: "upload",
      relationTo: "media",
      label: "Photo du fondateur",
    },
  ],
};
