import type { MetadataRoute } from "next";

import { getFormations, getSiteSettings } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, formations] = await Promise.all([getSiteSettings(), getFormations()]);

  const staticPages = [
    "",
    "/formations",
    "/intervenants",
    "/financement",
    "/association",
    "/galerie",
    "/contact",
    "/mentions-legales",
    "/confidentialite",
    "/cgv",
  ];

  return [
    ...staticPages.map((path) => ({
      url: `${site.url}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : path === "/formations" ? 0.95 : 0.8,
    })),
    ...formations.map((f) => ({
      url: `${site.url}/formations/${f.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: f.prioritaire ? 0.9 : 0.7,
    })),
  ];
}
