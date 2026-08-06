"use client";

import { useState } from "react";

import { MediaFrame } from "@/components/ui/MediaFrame";
import { cn } from "@/lib/utils";

type FormationDetailGalleryProps = {
  urls: string[];
  fallbackUrl: string;
  mimeType?: string;
  alt: string;
  glow?: boolean;
};

export function FormationDetailGallery({
  urls,
  fallbackUrl,
  mimeType,
  alt,
  glow,
}: FormationDetailGalleryProps) {
  const gallery = urls.length > 0 ? urls : [fallbackUrl];
  const [active, setActive] = useState(0);
  const mainSrc = gallery[active] ?? fallbackUrl;

  return (
    <div className="space-y-3">
      <MediaFrame
        src={mainSrc}
        mimeType={mimeType ?? "image/jpeg"}
        alt={alt}
        aspect="video"
        className={glow ? "gold-glow" : undefined}
      />
      {gallery.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {gallery.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Photo ${index + 1}`}
              aria-pressed={active === index}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-colors",
                active === index
                  ? "border-or/60 ring-1 ring-or/40"
                  : "border-border opacity-80 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
