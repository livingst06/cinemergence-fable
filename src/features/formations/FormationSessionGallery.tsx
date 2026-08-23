"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

export type FormationSessionSlide = {
  id: string;
  alt: string;
  url: string;
};

type FormationSessionGalleryProps = {
  slides: FormationSessionSlide[];
};

const INTERVAL_MS = 3000;

export function FormationSessionGallery({ slides }: FormationSessionGalleryProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  const count = slides.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex((next + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1 || paused || reducedMotion) return;
    const timer = window.setInterval(() => goTo(index + 1), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [count, goTo, index, paused, reducedMotion]);

  if (count === 0) return null;

  return (
    <div
      className="mt-8 md:mt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="card-stage relative overflow-hidden">
        <div className="relative aspect-[16/10] w-full bg-noir-tertiary md:aspect-[21/9]">
          {slides.map((slide, i) => {
            const active = i === index;
            const nearby =
              i === index ||
              i === (index + 1) % count ||
              i === (index - 1 + count) % count;
            if (!nearby) return null;
            return (
              <Image
                key={slide.id}
                src={slide.url}
                alt={slide.alt}
                fill
                sizes="100vw"
                quality={70}
                priority={i === 0}
                className={cn(
                  "pointer-events-none object-cover transition-opacity duration-700",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
            );
          })}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir-deep/50 via-transparent to-noir-deep/20" />

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-noir-deep/70 text-cream backdrop-blur-sm transition hover:border-projector/40 hover:bg-noir-deep/90 md:left-3"
                aria-label="Photo précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-noir-deep/70 text-cream backdrop-blur-sm transition hover:border-projector/40 hover:bg-noir-deep/90 md:right-3"
                aria-label="Photo suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {count > 1 && (
        <div className="mt-4 flex justify-center gap-1">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(i)}
              className="flex h-11 w-11 items-center justify-center"
              aria-label={`Aller à la photo ${i + 1}`}
            >
              <span
                className={cn(
                  "rounded-full transition-all",
                  i === index ? "h-2 w-8 bg-projector" : "h-2 w-2 bg-white/20",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
