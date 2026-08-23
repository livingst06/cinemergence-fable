import type { Metadata } from "next";

import { GalerieAdmin } from "@/features/galerie/GalerieAdmin";
import { getGalleryMedia, getInterviewMedia } from "@/lib/data";
import { isImageMimeType } from "@/lib/media-utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Galerie — Tournages et livrables",
  description:
    "Interviews d'élèves, photos et extraits des formations Cinémergence : plateaux de tournage et livrables.",
  alternates: { canonical: "/galerie" },
};

function toGridItem(item: {
  id: string | number;
  alt: string;
  url?: string;
  mimeType?: string;
  caption?: string;
  category?: string;
}) {
  if (!item.url) return [];
  return [
    {
      id: String(item.id),
      alt: item.alt,
      url: item.url,
      mimeType: item.mimeType,
      caption: item.caption,
      category: item.category,
    },
  ];
}

export default async function GaleriePage() {
  const [media, interviews] = await Promise.all([
    getGalleryMedia(),
    getInterviewMedia(),
  ]);
  const plateau = media.flatMap((item) =>
    item.url && isImageMimeType(item.mimeType, item.url) ? toGridItem(item) : [],
  );

  return (
    <GalerieAdmin
      interviews={interviews.flatMap(toGridItem)}
      plateau={plateau}
    />
  );
}
