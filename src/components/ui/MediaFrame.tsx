import Image from "next/image";

import { Placeholder } from "@/components/ui/Placeholder";
import { isVideoMimeType } from "@/lib/media-utils";
import { cn } from "@/lib/utils";

type MediaFrameProps = {
  src?: string;
  alt: string;
  mimeType?: string;
  poster?: string;
  aspect?: "video" | "square" | "portrait" | "wide";
  className?: string;
  variant?: "default" | "hero";
  sizes?: string;
  priority?: boolean;
  /** Load and autoplay the video file. Default off — show poster/image instead. */
  autoPlay?: boolean;
};

const aspectClasses = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9]",
};

function isVideoSrc(src: string, mimeType?: string) {
  return isVideoMimeType(mimeType) || /\.(mp4|webm|mov)(\?|$)/i.test(src);
}

export function MediaFrame({
  src,
  alt,
  mimeType,
  poster,
  aspect = "video",
  className,
  variant = "default",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  autoPlay = false,
}: MediaFrameProps) {
  if (!src) {
    return (
      <Placeholder
        label={alt}
        aspect={aspect}
        className={className}
        variant={variant}
      />
    );
  }

  const video = isVideoSrc(src, mimeType);
  const imageSrc = video ? poster : src;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-noir-tertiary",
        aspectClasses[aspect],
        variant === "hero" && "min-h-[280px] md:min-h-full",
        className,
      )}
    >
      {video && autoPlay ? (
        <video
          src={src}
          poster={poster}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          autoPlay
          preload="none"
          aria-label={alt}
        />
      ) : imageSrc ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes={sizes}
          quality={70}
          priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <Placeholder label={alt} aspect={aspect} className="h-full w-full" hideLabel />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir-deep/50 via-transparent to-transparent" />
    </div>
  );
}
