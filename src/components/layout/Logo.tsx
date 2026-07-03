import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-3", className)}
      aria-label="Cinémergence — Accueil"
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-noir-secondary text-lg font-heading text-projector transition-colors group-hover:border-projector/40 group-hover:bg-projector/10"
        aria-hidden
      >
        C
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-xl tracking-[0.08em] text-cream transition-colors group-hover:text-or-light md:text-2xl">
          Cinémergence
        </span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-text">
          Plateau · Paris
        </span>
      </span>
    </Link>
  );
}
