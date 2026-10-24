"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function paddingLeft(track: HTMLElement) {
  return Number.parseFloat(getComputedStyle(track).paddingLeft) || 0;
}

function nearestIndex(track: HTMLElement) {
  const edge = track.getBoundingClientRect().left + paddingLeft(track);
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < track.children.length; i++) {
    const item = track.children[i] as HTMLElement;
    const dist = Math.abs(item.getBoundingClientRect().left - edge);
    if (dist < bestDist) {
      best = i;
      bestDist = dist;
    }
  }
  return best;
}

function scrollToIndex(track: HTMLElement, index: number) {
  const item = track.children[index] as HTMLElement | undefined;
  if (!item) return;
  const left = item.offsetLeft - paddingLeft(track);
  // scrollTo fluide est ignoré par le navigateur quand scroll-snap est actif.
  track.style.scrollSnapType = "none";
  track.scrollTo({ left, behavior: "auto" });
  track.style.scrollSnapType = "";
}

function useStripTrack<T extends HTMLElement>(watchIndex = false) {
  const ref = useRef<T>(null);
  const [index, setIndex] = useState(1);

  const scrollByDir = useCallback((dir: number) => {
    const track = ref.current;
    if (!track) return;
    const count = track.children.length;
    if (count === 0) return;
    const next = Math.min(count - 1, Math.max(0, nearestIndex(track) + dir));
    scrollToIndex(track, next);
    if (watchIndex) setIndex(next + 1);
  }, [watchIndex]);

  useEffect(() => {
    const track = ref.current;
    if (!track) return;

    let pointerId = -1;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("button, a, video")) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      moved = false;
      try { track.setPointerCapture(event.pointerId); } catch { /* le pointeur n'est plus actif */ }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const delta = event.clientX - startX;
      if (!moved && Math.abs(delta) < 6) return;
      moved = true;
      track.classList.add("dragging");
      track.scrollLeft = startScroll - delta;
    };

    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      pointerId = -1;
      const shouldSnap = moved;
      moved = false;
      track.classList.remove("dragging");
      if (shouldSnap) {
        const next = nearestIndex(track);
        scrollToIndex(track, next);
        if (watchIndex) setIndex(next + 1);
      }
    };

    const onScroll = () => setIndex(nearestIndex(track) + 1);

    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onUp);
    if (watchIndex) track.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);
      if (watchIndex) track.removeEventListener("scroll", onScroll);
    };
  }, [watchIndex]);

  return { ref, scrollByDir, index };
}

function StripButtons({
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
}: {
  onPrev: () => void;
  onNext: () => void;
  prevLabel: string;
  nextLabel: string;
}) {
  return (
    <>
      <button type="button" aria-label={prevLabel} onClick={onPrev}>←</button>
      <button type="button" aria-label={nextLabel} onClick={onNext}>→</button>
    </>
  );
}

export type KheironPoster = {
  src: string;
  alt: string;
  title: string;
  caption: string;
};

export function KheironPosterShow({ posters }: { posters: readonly KheironPoster[] }) {
  const track = useStripTrack<HTMLUListElement>();
  return (
    <>
      <div className="wrap kh-bento-wrap">
        <div className="pl-head">
          <div>
            <span className="eyebrow">Son univers, de la scène à l&apos;écran</span>
            <p className="ps-sub">Et de retour dans la saison 2 de la série culte <em>Bref.</em></p>
          </div>
          <div className="pl-nav">
            <StripButtons
              onPrev={() => track.scrollByDir(-1)}
              onNext={() => track.scrollByDir(1)}
              prevLabel="Affiche précédente"
              nextLabel="Affiche suivante"
            />
          </div>
        </div>
      </div>
      <ul className="pl-track ps-track" ref={track.ref}>
        {posters.map((poster) => (
          <li className="ps-item" key={poster.src}>
            <figure>
              <div className="ps-img">
                <img decoding="async" src={poster.src} alt={poster.alt} width={560} height={840} loading="lazy" draggable={false} />
              </div>
              <figcaption><b>{poster.title}</b>{poster.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </>
  );
}

export type KheironVideo = { src: string; poster: string; nom: string };

export function KheironVideoShow({ videos }: { videos: readonly KheironVideo[] }) {
  const track = useStripTrack<HTMLDivElement>();
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
    <>
      <div className="vtrack" ref={track.ref}>
        {videos.map((video, index) => (
          <div className={playing === index ? "vcard playing" : "vcard"} key={video.src}>
            <video
              ref={(node) => { videoRefs.current[index] = node; }}
              src={video.src}
              poster={video.poster}
              preload="none"
              playsInline
              onPlay={() => {
                setPlaying(index);
                videoRefs.current.forEach((other, i) => { if (i !== index) other?.pause(); });
              }}
            />
            <button type="button" className="play" aria-label={`Lire le témoignage de ${video.nom}`} onClick={() => play(index)}>▶</button>
            <div className="cap"><b>{video.nom}</b><span>Élève Cinémergence</span></div>
          </div>
        ))}
      </div>
      <div className="vnav">
        <StripButtons
          onPrev={() => track.scrollByDir(-1)}
          onNext={() => track.scrollByDir(1)}
          prevLabel="Vidéo précédente"
          nextLabel="Vidéo suivante"
        />
      </div>
    </>
  );
}

export type KheironPhoto = { src: string; alt: string };

export function KheironPlateauShow({ photos }: { photos: readonly KheironPhoto[] }) {
  const track = useStripTrack<HTMLUListElement>(true);
  return (
    <>
      <div className="wrap">
        <div className="pl-head">
          <div>
            <span className="eyebrow">Sur le plateau</span>
            <h2>Nos élèves, en conditions réelles de tournage.</h2>
          </div>
          <div className="pl-nav">
            <span className="pl-count" aria-live="polite"><b>{track.index}</b> / {photos.length}</span>
            <StripButtons
              onPrev={() => track.scrollByDir(-1)}
              onNext={() => track.scrollByDir(1)}
              prevLabel="Photo précédente"
              nextLabel="Photo suivante"
            />
          </div>
        </div>
      </div>
      <ul className="pl-track" ref={track.ref}>
        {photos.map((photo) => (
          <li className="pl-item" key={photo.src}>
            <img decoding="async" src={photo.src} alt={photo.alt} width={720} height={900} loading="lazy" draggable={false} />
          </li>
        ))}
      </ul>
    </>
  );
}
