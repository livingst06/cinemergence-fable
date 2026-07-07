import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*", "video/*"],
  },
  admin: {
    useAsTitle: "alt",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "caption",
      type: "text",
    },
    {
      name: "category",
      type: "select",
      options: [
        { label: "Plateau", value: "plateau" },
        { label: "Livrable stagiaire", value: "livrable" },
        { label: "Portrait", value: "portrait" },
        { label: "Autre", value: "autre" },
      ],
      defaultValue: "autre",
    },
  ],
};
