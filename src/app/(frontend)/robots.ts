import type { MetadataRoute } from "next";

import { getSiteSettings } from "@/lib/data";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteSettings();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
