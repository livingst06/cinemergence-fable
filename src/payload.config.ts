import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";

import { Formations } from "./collections/Formations";
import { FormationSessions } from "./collections/FormationSessions";
import { FormSubmissions } from "./collections/FormSubmissions";
import { Inscriptions } from "./collections/Inscriptions";
import { Intervenants } from "./collections/Intervenants";
import { Media } from "./collections/Media";
import { SalonPosts } from "./collections/SalonPosts";
import { SessionSalons } from "./collections/SessionSalons";
import { Temoignages } from "./collections/Temoignages";
import { Users } from "./collections/Users";
import { LegalPages } from "./globals/LegalPages";
import { SiteSettings } from "./globals/SiteSettings";
import { resolvePayloadSecret } from "./lib/env-guards";
import { getStoragePlugins } from "./payload/storage";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      logout: {
        Button: "@/components/admin/LogoutButton#LogoutButton",
      },
    },
  },
  collections: [
    Users,
    Media,
    Formations,
    FormationSessions,
    SessionSalons,
    SalonPosts,
    Intervenants,
    Temoignages,
    FormSubmissions,
    Inscriptions,
  ],
  globals: [SiteSettings, LegalPages],
  editor: lexicalEditor(),
  email: ({ payload }) => ({
    name: "console",
    defaultFromAddress: "info@payloadcms.com",
    defaultFromName: "Payload",
    sendEmail: async ({ subject, to }) => {
      payload.logger.info({
        msg: "Payload email written to console",
        subject,
        to,
      });
    },
  }),
  secret: resolvePayloadSecret(),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
    // Shared DB with feat branches: never auto-drop their tables from main.
    push: false,
  }),
  plugins: getStoragePlugins(),
});
