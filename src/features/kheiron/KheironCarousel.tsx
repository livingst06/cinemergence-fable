"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { useReducedMotion } from "@/lib/use-reduced-motion";

function useSlideIndex(count: number, intervalMs: number | null, paused: boolean) {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex((next + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!intervalMs || count <= 1 || paused || reducedMotion) return;
    const timer = window.setInterval(() => goTo(index + 1), intervalMs);
    return () => window.clearInterval(timer);
  }, [count, goTo, index, intervalMs, paused, reducedMotion]);

  return { index, goTo };
}

function SlideControls({
  count,
  index,
  goTo,
  label,
}: {
  count: number;
  index: number;
  goTo: (next: number) => void;
  label: string;
}) {
  if (count <= 1) return null;
  return (
    <>
      <button type="button" className="k-arrow prev" aria-label={`${label} précédente`} onClick={() => goTo(index - 1)}>
        <ChevronLeft width={20} height={20} aria-hidden="true" />
      </button>
      <button type="button" className="k-arrow next" aria-label={`${label} suivante`} onClick={() => goTo(index + 1)}>
        <ChevronRight width={20} height={20} aria-hidden="true" />
      </button>
    </>
  );
}

function SlideDots({
  count,
  index,
  goTo,
  label,
}: {
  count: number;
  index: number;
  goTo: (next: number) => void;
  label: string;
}) {
  if (count <= 1) return null;
  return (
    <div className="k-dots">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Aller à ${label} ${i + 1}`}
          aria-current={i === index ? "true" : undefined}
          onClick={() => goTo(i)}
        />
      ))}
    </div>
  );
}

function ShowShell({
  count,
  intervalMs,
  children,
}: {
  count: number;
  intervalMs: number | null;
  children: (state: { index: number; goTo: (next: number) => void }) => ReactNode;
}) {
  const [paused, setPaused] = useState(false);
  const { index, goTo } = useSlideIndex(count, intervalMs, paused);
  return (
    <div
      className="k-show"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {children({ index, goTo })}
    </div>
  );
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export type KheironPoster = {
  src: string;
  alt: string;
  title: string;
  caption: string;
};

export function KheironPosterShow({ posters }: { posters: readonly KheironPoster[] }) {
  const count = posters.length;
  return (
    <ShowShell count={count} intervalMs={5000}>
      {({ index, goTo }) => {
        const current = posters[index];
        return (
          <>
            <div className="k-frame k-frame-poster">
              <div className="k-poster-slot">
                {posters.map((poster, i) => {
                  const nearby = i === index || i === (index + 1) % count || i === (index - 1 + count) % count;
                  if (!nearby) return null;
                  const active = i === index;
                  return (
                    <img
                      key={poster.src}
                      src={poster.src}
                      alt={active ? poster.alt : ""}
                      aria-hidden={active ? undefined : true}
                      width={560}
                      height={840}
                      decoding="async"
                      className={active ? "is-on" : undefined}
                    />
                  );
                })}
              </div>
              <SlideControls count={count} index={index} goTo={goTo} label="Affiche" />
            </div>
            <p className="k-caption">
              <span className="k-count">{pad(index + 1)} / {pad(count)}</span>
              <b>{current.title}</b>
              {current.caption}
            </p>
            <SlideDots count={count} index={index} goTo={goTo} label="l'affiche" />
          </>
        );
      }}
    </ShowShell>
  );
}

export type KheironPhoto = { src: string; alt: string };

export function KheironPlateauShow({ photos }: { photos: readonly KheironPhoto[] }) {
  const count = photos.length;
  return (
    <ShowShell count={count} intervalMs={5000}>
      {({ index, goTo }) => {
        const current = photos[index];
        return (
          <>
            <div className="k-frame k-frame-photo">
              {photos.map((photo, i) => {
                const nearby = i === index || i === (index + 1) % count || i === (index - 1 + count) % count;
                if (!nearby) return null;
                const active = i === index;
                return (
                  <img
                    key={photo.src}
                    src={photo.src}
                    alt={active ? photo.alt : ""}
                    aria-hidden={active ? undefined : true}
                    width={1200}
                    height={750}
                    decoding="async"
                    loading={i === 0 ? "eager" : "lazy"}
                    className={active ? "is-on" : undefined}
                  />
                );
              })}
              <div className="k-shade" />
              <SlideControls count={count} index={index} goTo={goTo} label="Photo" />
              <div className="k-show-meta">
                <p className="k-count">{pad(index + 1)} / {pad(count)}</p>
                <p>{current.alt}</p>
              </div>
            </div>
            <SlideDots count={count} index={index} goTo={goTo} label="la photo" />
          </>
        );
      }}
    </ShowShell>
  );
}

export type KheironVideo = { src: string; poster: string; nom: string };

export function KheironVideoShow({ videos }: { videos: readonly KheironVideo[] }) {
  const count = videos.length;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <ShowShell count={count} intervalMs={null}>
      {({ index, goTo }) => {
        const video = videos[index];
        const change = (next: number) => {
          setPlaying(false);
          goTo(next);
        };
        return (
          <>
            <div className="k-video-row">
              {count > 1 && (
                <button type="button" className="k-arrow" aria-label="Vidéo précédente" onClick={() => change(index - 1)}>
                  <ChevronLeft width={20} height={20} aria-hidden="true" />
                </button>
              )}
              <div className={playing ? "vcard playing" : "vcard"}>
                <video
                  key={video.src}
                  ref={videoRef}
                  src={video.src}
                  poster={video.poster}
                  preload="none"
                  playsInline
                />
                <button
                  type="button"
                  className="play"
                  aria-label={`Lire le témoignage de ${video.nom}`}
                  onClick={() => {
                    const node = videoRef.current;
                    if (!node) return;
                    setPlaying(true);
                    node.controls = true;
                    void node.play().catch(() => undefined);
                  }}
                >
                  ▶
                </button>
                <div className="cap"><b>{video.nom}</b><span>Élève Cinémergence</span></div>
              </div>
              {count > 1 && (
                <button type="button" className="k-arrow" aria-label="Vidéo suivante" onClick={() => change(index + 1)}>
                  <ChevronRight width={20} height={20} aria-hidden="true" />
                </button>
              )}
            </div>
            <SlideDots count={count} index={index} goTo={change} label="la vidéo" />
          </>
        );
      }}
    </ShowShell>
  );
}
