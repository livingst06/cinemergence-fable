"use client";

import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { useMemo, useState } from "react";

import { isVideoMimeType } from "@/lib/media-utils";
import { cn } from "@/lib/utils";

export type GalleryGridItem = {
  id: string;
  alt: string;
  url: string;
  mimeType?: string;
  poster?: string;
};

type GalleryGridProps = {
  items: GalleryGridItem[];
  /** Grille plus dense — interviews / extraits courts. */
  compact?: boolean;
};

function isVideo(item: GalleryGridItem) {
  return isVideoMimeType(item.mimeType) || /\.(mp4|webm|mov)(\?|$)/i.test(item.url);
}

function previewSrc(item: GalleryGridItem) {
  if (isVideo(item)) return item.poster ?? "/videos/hero-plateau-poster.jpg";
  return item.url;
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
            ? "grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3"
            : "grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3",
        )}
      >
        {items.map((item) => (
          <article
            key={item.id}
            className="group relative min-w-0 overflow-hidden rounded-2xl border border-white/[0.08]"
          >
            <div className="relative aspect-video bg-noir-tertiary">
              <Image
                src={previewSrc(item)}
                alt={item.alt}
                fill
                sizes={
                  compact
                    ? "(max-width: 768px) 100vw, 33vw"
                    : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                }
                quality={70}
                className="object-cover"
              />
            </div>
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
            className="fixed inset-0 z-[100011] flex items-center justify-center overflow-auto overscroll-contain p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] pl-[max(1rem,env(safe-area-inset-left,0px))] outline-none transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0"
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpenId(null);
            }}
          >
            {active && (
              <>
                <Dialog.Title className="sr-only">{active.alt}</Dialog.Title>
                <Dialog.Close
                  className="absolute top-[max(1rem,env(safe-area-inset-top,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-noir-deep/80 text-cream backdrop-blur-sm transition-colors hover:bg-noir-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-convert-light"
                  aria-label="Fermer"
                >
                  <X className="size-5" />
                </Dialog.Close>
                {isVideo(active) ? (
                  <video
                    key={active.id}
                    src={active.url}
                    className="max-h-[min(90dvh,90vh)] max-w-full rounded-lg"
                    controls
                    autoPlay
                    playsInline
                    preload="none"
                    poster={active.poster}
                    onClick={(event) => event.stopPropagation()}
                  />
                ) : (
                  <Image
                    src={active.url}
                    alt={active.alt}
                    width={1920}
                    height={1080}
                    quality={80}
                    className="max-h-[min(90dvh,90vh)] max-w-full rounded-lg object-contain"
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
