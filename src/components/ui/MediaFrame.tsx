import { Placeholder } from "@/components/ui/Placeholder";
import { isVideoMimeType } from "@/lib/media-utils";
import { cn } from "@/lib/utils";

type MediaFrameProps = {
  src?: string;
  alt: string;
  mimeType?: string;
  aspect?: "video" | "square" | "portrait" | "wide";
  className?: string;
  variant?: "default" | "hero";
};

const aspectClasses = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9]",
};

export function MediaFrame({
  src,
  alt,
  mimeType,
  aspect = "video",
  className,
  variant = "default",
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

  const isVideo = isVideoMimeType(mimeType) || /\.(mp4|webm|mov)(\?|$)/i.test(src);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-noir-tertiary",
        aspectClasses[aspect],
        variant === "hero" && "min-h-[280px] md:min-h-full",
        className,
      )}
    >
      {isVideo ? (
        <video
          src={src}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-label={alt}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir-deep/50 via-transparent to-transparent" />
    </div>
  );
}
