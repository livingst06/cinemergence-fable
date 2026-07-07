import { defaultSite } from "./defaults";

/** Canonical public site URL (no trailing slash). Env wins over Payload/defaults. */
export function getPublicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const raw = fromEnv || defaultSite.url;
  return raw.replace(/\/+$/, "");
}
