import { cn } from "@/lib/utils";

type HeroVideoBackgroundProps = {
  poster?: string;
  src?: string;
  srcMobile?: string;
};

const videoClassName =
  "absolute inset-0 h-full w-full object-cover object-[55%_center]";

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

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-noir/75 via-noir/45 to-noir/10 md:from-noir/60 md:via-noir/30 md:to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir/45 via-transparent to-noir/20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgba(90,109,128,0.10),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_20%,rgba(61,79,97,0.14),transparent_60%)]" />
    </div>
  );
}
