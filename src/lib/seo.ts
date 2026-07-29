import type { SiteConfig } from "./data";

export function organizationJsonLd(site: SiteConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: site.name,
    alternateName: "Cinémergence — École de formation cinéma",
    description: site.description,
    url: site.url,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Paris",
      addressRegion: "Île-de-France",
      addressCountry: "FR",
    },
  };
}

export function courseJsonLd(
  formation: {
    titre: string;
    metaDescription: string;
    slug: string;
    duree: string;
  },
  site: SiteConfig,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: formation.titre,
    description: formation.metaDescription,
    url: `${site.url}/formations/${formation.slug}`,
    provider: {
      "@type": "EducationalOrganization",
      name: site.name,
      description: "École de formation cinéma",
    },
    timeRequired: formation.duree,
  };
}
