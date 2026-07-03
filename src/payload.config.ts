import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";

import { Formations } from "./collections/Formations";
import { FormSubmissions } from "./collections/FormSubmissions";
import { Intervenants } from "./collections/Intervenants";
import { Media } from "./collections/Media";
import { Temoignages } from "./collections/Temoignages";
import { Users } from "./collections/Users";
import { LegalPages } from "./globals/LegalPages";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Formations,
    Intervenants,
    Temoignages,
    FormSubmissions,
  ],
  globals: [SiteSettings, LegalPages],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "dev-secret-change-in-production-min-32",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
});
