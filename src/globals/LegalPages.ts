import type { GlobalConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

export const LegalPages: GlobalConfig = {
  slug: "legal-pages",
  label: "Pages légales",
  fields: [
    {
      name: "mentionsLegales",
      type: "richText",
      editor: lexicalEditor(),
      required: true,
    },
    {
      name: "confidentialite",
      type: "richText",
      editor: lexicalEditor(),
      required: true,
    },
    {
      name: "cgv",
      type: "richText",
      editor: lexicalEditor(),
      required: true,
    },
  ],
};
