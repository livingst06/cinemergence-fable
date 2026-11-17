import Image from "next/image";
import Link from "next/link";

import type { FormationData } from "@/lib/formation-types";
import { formationPath } from "@/lib/formation-types";
import { resolveFormationCoverUrl } from "@/lib/site-media";
import { cn } from "@/lib/utils";

/** Largeur fixe : ne suit pas la fenêtre. `max-w-full` seulement si l’écran est plus étroit. */
export const heroFeaturedCardWidthClass = "w-[19rem] max-w-full shrink-0";

type HeroFeaturedCardProps = {
  formation: Pick<FormationData, "slug" | "titre" | "coverImageUrl">;
};

export function HeroFeaturedCard({ formation }: HeroFeaturedCardProps) {
  const cover = resolveFormationCoverUrl(formation.slug, formation.coverImageUrl);
  const faceCrop = formation.slug === "kheiron";

  return (
    <Link
      href={formationPath(formation.slug)}
      className={cn(
        heroFeaturedCardWidthClass,
        "group relative flex self-start overflow-visible focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-convert/50",
      )}
    >
      <div className="relative w-full overflow-hidden rounded-none border border-white/10 transition-colors group-hover:border-white/25">
        <div
          className="pointer-events-none absolute inset-0 bg-[#151b22]/35 backdrop-blur-md"
          aria-hidden
        />
        <div className="relative z-10 flex items-center gap-3 p-2 md:gap-4 md:p-2.5">
          <div className="relative h-[9.25rem] w-[7rem] shrink-0 overflow-hidden rounded-xl">
            <Image
              src={cover}
              alt=""
              fill
              sizes="124px"
              className={cn("object-cover", faceCrop ? "object-[center_12%]" : "object-center")}
            />
          </div>
          <div className="min-w-0">
            <p className="line-clamp-4 text-left font-heading text-sm font-semibold leading-snug whitespace-pre-line text-cream">
              {formation.titre}
            </p>
          </div>
        </div>
      </div>
      <span className="hero-new-badge">À LA UNE</span>
    </Link>
  );
}
