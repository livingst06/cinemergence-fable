import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { FormationCardSessionsBanner } from "@/features/formations/FormationCardSessionsBanner";
import type { FormationData } from "@/lib/defaults";
import { formationLivrableLabel, formationPath } from "@/lib/defaults";
import { resolveFormationCoverUrl } from "@/lib/site-media";
import { cn } from "@/lib/utils";

type FormationCardProps = {
  formation: FormationData;
  /** Conservé pour compat — toutes les cards ont désormais le même format. */
  featured?: boolean;
};

export function FormationCard({ formation }: FormationCardProps) {
  const coverSrc = resolveFormationCoverUrl(formation.slug, formation.coverImageUrl);
  const href = formationPath(formation.slug);

  return (
    <article
      className={cn(
        "card-stage flex h-auto w-full flex-col overflow-hidden transition-all duration-500",
        "hover:-translate-y-1 hover:plateau-glow",
        "md:h-full",
      )}
    >
      <Link
        href={href}
        aria-label={`Voir la formation ${formation.titreCourt}`}
        className="group flex min-h-0 flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or/50"
      >
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
          <MediaFrame
            src={coverSrc}
            mimeType={formation.coverImageMimeType ?? "image/jpeg"}
            alt=""
            aspect="video"
            className="h-full rounded-none border-0 border-b border-white/[0.06] !aspect-auto"
          />
          {formation.prioritaire && (
            <span className="absolute left-3 top-3 rounded-full bg-projector px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream shadow-lg">
              À la une
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4 md:gap-2.5 md:p-5">
          <Badge variant="outline" className="w-fit shrink-0 border-or/25 bg-or/5 text-or-light">
            {formation.pole}
          </Badge>
          <h3 className="line-clamp-2 font-heading text-[clamp(1.15rem,3.2vw,1.55rem)] leading-[1.15] text-cream">
            {formation.titre}
          </h3>
          <p className="line-clamp-2 text-sm leading-snug text-muted-text">
            {formation.accroche}
          </p>
          <p className="line-clamp-2 border-t border-white/[0.06] pt-2.5 text-[10px] font-medium uppercase leading-snug tracking-[0.12em] text-or-light md:text-xs">
            Livrable · {formationLivrableLabel(formation)}
          </p>
          {formation.effectifMax != null && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-text">
              {formation.effectifMax} places max par session
            </p>
          )}
        </div>
      </Link>

      <FormationCardSessionsBanner href={href} />
    </article>
  );
}
