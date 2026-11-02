"use client";

import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useRef, useState } from "react";

import { Section, SectionHeader } from "@/components/ui/Section";
import { temoignageVideoCopy, temoignageVideos } from "@/features/temoignages-video/videos";

function scrollByCard(track: HTMLDivElement, dir: number) {
  const cards = [...track.children] as HTMLElement[];
  if (cards.length === 0) return;
  const edge = track.getBoundingClientRect().left;
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  cards.forEach((card, index) => {
    const dist = Math.abs(card.getBoundingClientRect().left - edge);
    if (dist < bestDist) {
      best = index;
      bestDist = dist;
    }
  });
  const next = Math.min(cards.length - 1, Math.max(0, best + dir));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  track.style.scrollSnapType = "none";
  track.scrollTo({
    left: cards[next].offsetLeft,
    behavior: reduce ? "auto" : "smooth",
  });
  window.setTimeout(() => {
    track.style.scrollSnapType = "";
  }, reduce ? 0 : 450);
}

export function TemoignagesVideo() {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [playing, setPlaying] = useState<number | null>(null);

  const play = (index: number) => {
    setPlaying(index);
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === index) {
        video.controls = true;
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
  };

  return (
    <Section compact>
      <div className="container-page">
        <p className="eyebrow">{temoignageVideoCopy.eyebrow}</p>
        <SectionHeader
          title={temoignageVideoCopy.title}
          align="left"
          className="mt-3 mb-6 md:mb-8"
          description={temoignageVideoCopy.lead}
        />
        <div
          ref={trackRef}
          aria-label="Témoignages vidéo"
          className="relative flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {temoignageVideos.map((video, index) => {
            const active = playing === index;
            return (
              <article
                key={video.src}
                className="relative flex aspect-[9/16] w-[clamp(220px,42vw,270px)] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-2xl border border-white/[0.08] bg-noir-secondary"
              >
                <video
                  ref={(node) => {
                    videoRefs.current[index] = node;
                  }}
                  src={video.src}
                  poster={video.poster}
                  preload="none"
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                  onPlay={() => {
                    setPlaying(index);
                    videoRefs.current.forEach((other, i) => {
                      if (i !== index) other?.pause();
                    });
                  }}
                />
                <button
                  type="button"
                  className={
                    active
                      ? "hidden"
                      : "absolute top-1/2 left-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-convert text-white shadow-[0_0_0_8px_rgba(47,91,255,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-noir"
                  }
                  aria-label={`Lire le témoignage de ${video.nom}`}
                  onClick={() => play(index)}
                >
                  <Play className="size-6 fill-white" aria-hidden />
                </button>
                <div
                  className={
                    active
                      ? "hidden"
                      : "pointer-events-none relative bg-gradient-to-t from-noir-deep/95 to-transparent px-4 pt-10 pb-4"
                  }
                >
                  <p className="text-[15px] font-semibold text-cream">{video.nom}</p>
                  <p className="caption-copy mt-0.5 tracking-[0.12em] text-cream/70 uppercase">
                    Élève Cinémergence
                  </p>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            aria-label="Vidéo précédente"
            onClick={() => {
              const track = trackRef.current;
              if (track) scrollByCard(track, -1);
            }}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-noir-secondary text-cream transition hover:border-convert/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-convert-light"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Vidéo suivante"
            onClick={() => {
              const track = trackRef.current;
              if (track) scrollByCard(track, 1);
            }}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-noir-secondary text-cream transition hover:border-convert/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-convert-light"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </Section>
  );
}
