import { cn } from "@/lib/utils";

type PlaceholderProps = {
  label: string;
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

export function Placeholder({ label, aspect = "video", className, variant = "default" }: PlaceholderProps) {
  return (
    <div
      className={cn(
        "relative flex items-end justify-start overflow-hidden rounded-2xl border border-white/[0.06] bg-noir-tertiary",
        aspectClasses[aspect],
        variant === "hero" && "min-h-[280px] md:min-h-full",
        className,
      )}
      role="img"
      aria-label={label}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(139,26,43,0.2),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_90%,rgba(61,79,97,0.35),transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-noir-deep via-transparent to-transparent opacity-90" />
      <div className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.5)_0_1px,transparent_1px_3px)]" />

      {variant === "hero" && (
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-noir-deep/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-projector-light backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-projector" />
          En tournage
        </div>
      )}

      <p className="relative z-10 p-5 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-cream/50">
        {label}
      </p>
    </div>
  );
}
