import type { Metadata } from "next";

/** Aperçu de lien : WhatsApp, Facebook, Instagram, LinkedIn, X, Telegram, Slack, Discord, iMessage. */
export const SHARE_IMAGE_PATH = "/images/brand/og-cinemergence.jpg";

export const shareImage = {
  url: SHARE_IMAGE_PATH,
  width: 1200,
  height: 675,
  alt: "Cinémergence — Formations cinéma, acting et tournage",
  type: "image/jpeg",
} as const;

type SocialFields = {
  title?: string;
  description?: string;
  url?: string;
  siteName?: string;
};

/** Open Graph + carte X. Le titre de la page est repris s'il n'est pas fourni ici. */
export function socialMetadata(fields: SocialFields = {}): Pick<Metadata, "openGraph" | "twitter"> {
  const { title, description, url, siteName = "Cinémergence" } = fields;
  return {
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(url ? { url } : {}),
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: [shareImage],
    },
  };
}
