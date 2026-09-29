import { cn } from "@/lib/utils";

type HeroVideoBackgroundProps = {
  poster?: string;
  src?: string;
  srcMobile?: string;
};

const videoClassName =
  "hero-bg-media absolute inset-0 h-full w-full object-cover";

type HeroVideoProps = {
  src: string;
  poster: string;
  className?: string;
};

function HeroVideo({ src, poster, className }: HeroVideoProps) {
  return (
    <video
      className={cn("hero-bg-video", videoClassName, className)}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      src={src}
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      {...{ "webkit-playsinline": "true" }}
    />
  );
}

export function HeroVideoBackground({
  poster = "/videos/hero-plateau-poster.jpg",
  src = "/videos/hero-plateau-travel.mp4",
  srcMobile,
}: HeroVideoBackgroundProps) {
  const mobileSrc = srcMobile ?? src;

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
      <HeroVideo src={mobileSrc} poster={poster} className="md:hidden" />
      <HeroVideo src={src} poster={poster} className="hidden md:block" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-noir/85 via-noir/50 to-noir/10 md:from-noir/75 md:via-noir/35 md:to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent to-noir/30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgba(47,91,255,0.16),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_20%,rgba(47,91,255,0.12),transparent_60%)]" />
    </div>
  );
}
