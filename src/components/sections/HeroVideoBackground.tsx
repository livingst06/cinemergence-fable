"use client";

import { useSyncExternalStore } from "react";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

type HeroVideoBackgroundProps = {
  poster?: string;
  src?: string;
};

export function HeroVideoBackground({
  poster = "/videos/hero-plateau-poster.jpg",
  src = "/videos/hero-plateau-travel.mp4",
}: HeroVideoBackgroundProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none" aria-hidden>
      {reducedMotion ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          draggable={false}
          className="pointer-events-none h-full w-full scale-105 object-cover object-center"
        />
      ) : (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
          tabIndex={-1}
          className="pointer-events-none h-full w-full scale-[1.08] object-cover object-[55%_center]"
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-noir via-noir/92 to-noir/25 md:via-noir/78 md:to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir via-transparent to-noir/50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgba(139,26,43,0.14),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_20%,rgba(61,79,97,0.25),transparent_60%)]" />
    </div>
  );
}
