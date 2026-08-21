"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

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

function subscribeMobile(callback: () => void) {
  const mq = window.matchMedia("(max-width: 767px)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function subscribeConnection(callback: () => void) {
  const connection = getConnection();
  if (!connection?.addEventListener) return () => {};
  connection.addEventListener("change", callback);
  return () => connection.removeEventListener("change", callback);
}

function getConnection():
  | (EventTarget & { saveData?: boolean; effectiveType?: string })
  | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean; effectiveType?: string } })
    .connection;
}

function getSaveDataSnapshot() {
  const connection = getConnection();
  if (!connection) return false;
  return (
    Boolean(connection.saveData) ||
    connection.effectiveType === "2g" ||
    connection.effectiveType === "slow-2g"
  );
}

type HeroVideoBackgroundProps = {
  poster?: string;
  src?: string;
  srcMobile?: string;
};

const mediaClassName =
  "pointer-events-none h-full w-full scale-[1.08] object-cover object-[55%_center]";

export function HeroVideoBackground({
  poster = "/videos/hero-plateau-poster.jpg",
  src = "/videos/hero-plateau-travel.mp4",
  srcMobile,
}: HeroVideoBackgroundProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const saveData = useSyncExternalStore(
    subscribeConnection,
    getSaveDataSnapshot,
    () => false,
  );
  const isMobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, () => false);
  const skipVideo = reducedMotion || saveData;
  const videoSrc = isMobile && srcMobile ? srcMobile : src;

  const [loadVideo, setLoadVideo] = useState(false);
  const [readySrc, setReadySrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoReady = readySrc === videoSrc;

  useEffect(() => {
    if (skipVideo) return;
    let cancelled = false;
    const start = () => {
      if (!cancelled) setLoadVideo(true);
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === "function") {
      const id = idleWindow.requestIdleCallback(start, { timeout: 900 });
      return () => {
        cancelled = true;
        idleWindow.cancelIdleCallback?.(id);
      };
    }

    const timeout = window.setTimeout(start, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [skipVideo]);

  useEffect(() => {
    if (!loadVideo || skipVideo) return;
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    el.load();
    void el.play().catch(() => undefined);

    const onVisibility = () => {
      if (document.hidden) {
        el.pause();
        return;
      }
      void el.play().catch(() => undefined);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [loadVideo, skipVideo, videoSrc]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        draggable={false}
        fetchPriority="high"
        decoding="async"
        className={mediaClassName}
      />
      {loadVideo && !skipVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          tabIndex={-1}
          onCanPlay={() => setReadySrc(videoSrc)}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            mediaClassName,
            videoReady ? "opacity-100" : "opacity-0",
          )}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-noir via-noir/92 to-noir/25 md:via-noir/78 md:to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir via-transparent to-noir/50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgba(90,109,128,0.16),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_20%,rgba(61,79,97,0.25),transparent_60%)]" />
    </div>
  );
}
