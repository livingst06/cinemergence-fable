"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/ButtonLink";
import type { GalleryMediaItem } from "@/lib/data";
import { cn } from "@/lib/utils";

type PlateauCarouselProps = {
  slides: GalleryMediaItem[];
};

export function PlateauCarousel({ slides }: PlateauCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = slides.length;
  const current = slides[index];

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex((next + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = window.setInterval(() => goTo(index + 1), 5000);
    return () => window.clearInterval(timer);
  }, [count, goTo, index, paused]);

  if (count === 0) return null;

  return (
    <div
      className="mx-auto max-w-5xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="card-stage relative overflow-hidden">
        <div className="relative aspect-[16/10] w-full bg-noir-tertiary md:aspect-[21/9]">
          {slides.map((slide, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={String(slide.id)}
              src={slide.url}
              alt={slide.alt}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
                i === index ? "opacity-100" : "opacity-0",
              )}
              loading={i === 0 ? "eager" : "lazy"}
            />
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir-deep/80 via-noir-deep/10 to-noir-deep/30" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_80%_20%,rgba(139,26,43,0.18),transparent_55%)]" />

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-noir-deep/70 text-cream backdrop-blur-sm transition hover:border-projector/40 hover:bg-noir-deep/90"
                aria-label="Photo précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-noir-deep/70 text-cream backdrop-blur-sm transition hover:border-projector/40 hover:bg-noir-deep/90"
                aria-label="Photo suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 z-10 p-5 md:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-or-light">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>
            <p className="mt-2 max-w-2xl font-heading text-xl text-cream md:text-2xl">
              {current.alt}
            </p>
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={String(slide.id)}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index
                  ? "w-8 bg-projector"
                  : "w-2 bg-white/20 hover:bg-white/40",
              )}
              aria-label={`Aller à la photo ${i + 1}`}
            />
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <ButtonLink
          href="/galerie"
          variant="outline"
          className="btn-outline-warm rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wider"
        >
          Voir toute la galerie
        </ButtonLink>
      </div>
    </div>
  );
}
