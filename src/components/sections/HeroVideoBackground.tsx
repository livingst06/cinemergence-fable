"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type HeroVideoBackgroundProps = {
  poster?: string;
  src?: string;
  srcMobile?: string;
};

const videoClassName =
  "hero-bg-media absolute inset-0 h-full w-full object-cover";

const DESKTOP_QUERY = "(min-width: 768px)";

export function HeroVideoBackground({
  poster = "/videos/hero-plateau-poster.jpg",
  src = "/videos/hero-plateau-travel.mp4",
  srcMobile,
}: HeroVideoBackgroundProps) {
  const mobileSrc = srcMobile ?? src;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const assign = () => {
      const next = window.matchMedia(DESKTOP_QUERY).matches ? src : mobileSrc;
      if (video.dataset.loadedSrc === next) return;
      video.dataset.loadedSrc = next;
      video.src = next;
      void video.play().catch(() => {});
    };

    if (document.readyState === "complete") assign();
    else window.addEventListener("load", assign, { once: true });

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = () => {
      if (document.readyState === "complete") assign();
    };
    desktop.addEventListener("change", onBreakpoint);

    return () => {
      window.removeEventListener("load", assign);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [src, mobileSrc]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        draggable={false}
        fetchPriority="high"
        decoding="async"
        className={videoClassName}
      />
      <video
        ref={videoRef}
        className={cn("hero-bg-video", videoClassName)}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        {...{ "webkit-playsinline": "true" }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-noir/85 via-noir/50 to-noir/10 md:from-noir/75 md:via-noir/35 md:to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent to-noir/30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgba(47,91,255,0.16),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_20%,rgba(47,91,255,0.12),transparent_60%)]" />
    </div>
  );
}
