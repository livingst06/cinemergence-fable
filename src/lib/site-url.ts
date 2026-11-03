import { defaultSite } from "./defaults";

const PUBLIC_PRODUCTION_URL = "https://cinemergence.fr";

/**
 * Canonical public site URL (no trailing slash).
 * The production alias cinemergence.vercel.app is always rewritten to the public domain
 * so canonicals, the sitemap and metadataBase do not point at the Vercel copy.
 */
export function getPublicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const raw = (fromEnv || defaultSite.url).replace(/\/+$/, "");
  if (raw === "https://cinemergence.vercel.app") return PUBLIC_PRODUCTION_URL;
  return raw;
}
