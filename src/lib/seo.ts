import type { SiteConfig } from "./data";
import { SHARE_IMAGE_PATH } from "./share-metadata";

/** Balise Meta à garder dans chaque layout racine, y compris après la vérification. */
export const facebookDomainVerification = {
  "facebook-domain-verification": "hd83t59mns0ae5cbnjw9mue83ome5b",
} as const;

export function organizationJsonLd(site: SiteConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: site.name,
    alternateName: "Cinémergence — École de formation cinéma",
    description: site.description,
    url: site.url,
    image: new URL(SHARE_IMAGE_PATH, site.url).href,
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
