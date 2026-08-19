"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Play, X } from "lucide-react";
import { useMemo, useState } from "react";

import { MediaFrame } from "@/components/ui/MediaFrame";
import { isVideoMimeType } from "@/lib/media-utils";
import { cn } from "@/lib/utils";

export type GalleryGridItem = {
  id: string;
  alt: string;
  url: string;
  mimeType?: string;
};

type GalleryGridProps = {
  items: GalleryGridItem[];
  /** Grille plus dense — interviews / extraits courts. */
  compact?: boolean;
};

function isVideo(item: GalleryGridItem) {
  return isVideoMimeType(item.mimeType) || /\.(mp4|webm|mov)(\?|$)/i.test(item.url);
}

export function GalleryGrid({ items, compact = false }: GalleryGridProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = useMemo(
    () => items.find((item) => item.id === openId) ?? null,
    [items, openId],
  );

  return (
    <>
      <div
        className={cn(
          "grid",
          compact
            ? "grid-cols-2 gap-3 sm:grid-cols-3"
            : "gap-4 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {items.map((item) => (
          <article
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08]"
          >
            <MediaFrame
              src={item.url}
              mimeType={item.mimeType}
              alt={item.alt}
              aspect="video"
              className="h-full w-full rounded-none border-0"
            />
            {isVideo(item) && (
              <span className="pointer-events-none absolute bottom-3 left-3 z-[1] flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-noir-deep/75 text-cream backdrop-blur-sm">
                <Play className="size-3.5 fill-cream" />
              </span>
            )}
            <button
              type="button"
              className="absolute inset-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-convert-light focus-visible:ring-inset"
              onClick={() => setOpenId(item.id)}
              aria-label={`Agrandir : ${item.alt}`}
            />
          </article>
        ))}
      </div>

      <Dialog.Root
        open={Boolean(active)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setOpenId(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-[100010] bg-noir-deep/90 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup
            className="fixed inset-0 z-[100011] flex items-center justify-center p-4 outline-none transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0"
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpenId(null);
            }}
          >
            {active && (
              <>
                <Dialog.Title className="sr-only">{active.alt}</Dialog.Title>
                <Dialog.Close
                  className="absolute top-4 right-4 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-noir-deep/80 text-cream backdrop-blur-sm transition-colors hover:bg-noir-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-convert-light"
                  aria-label="Fermer"
                >
                  <X className="size-5" />
                </Dialog.Close>
                {isVideo(active) ? (
                  <video
                    key={active.id}
                    src={active.url}
                    className="max-h-[90vh] max-w-full rounded-lg"
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    onClick={(event) => event.stopPropagation()}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={active.url}
                    alt={active.alt}
                    className="max-h-[90vh] max-w-full rounded-lg object-contain"
                    onClick={(event) => event.stopPropagation()}
                  />
                )}
              </>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
