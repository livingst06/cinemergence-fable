import Link from "next/link";

import { MediaFrame } from "@/components/ui/MediaFrame";
import type { FormationData } from "@/lib/defaults";
import { formationPath } from "@/lib/defaults";
import { summarizeFormationTiles } from "@/lib/formation-format";
import { resolveFormationCoverUrl } from "@/lib/site-media";

export type FormationMiniCardData = Pick<
  FormationData,
  | "slug"
  | "titre"
  | "titreCourt"
  | "coverImageUrl"
  | "coverImageMimeType"
  | "duree"
  | "dureeHeures"
  | "dureeJours"
  | "format"
  | "tarif"
  | "effectifMax"
  | "publicCible"
>;

type FormationMiniCardProps = {
  formation: FormationMiniCardData;
};

export function FormationMiniCard({ formation }: FormationMiniCardProps) {
  const coverSrc = resolveFormationCoverUrl(formation.slug, formation.coverImageUrl);
  const href = formationPath(formation.slug);
  const bullets = summarizeFormationTiles(formation);

  return (
    <article className="mini-card-flip">
      <Link
        href={href}
        aria-label={`Voir la formation ${formation.titreCourt}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or/50"
      >
        <div className="mini-card-scene">
          <div className="mini-card-flip-inner">
            <div className="mini-card-front">
              <MediaFrame
                src={coverSrc}
                mimeType={formation.coverImageMimeType ?? "image/jpeg"}
                alt=""
                aspect="video"
                sizes="(max-width: 1023px) 50vw, 25vw"
                className="h-full rounded-none border-0 !aspect-auto"
              />
            </div>
            <div className="mini-card-back">
              <ul className="space-y-1 text-left">
                {bullets.map((item) => (
                  <li key={item.label} className="flex gap-2">
                    <span
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-projector"
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-or-light">
                        {item.label}
                      </span>
                      <span className="mt-0.5 line-clamp-1 block text-[11px] leading-snug text-cream md:text-xs">
                        {item.value}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="p-2.5 md:p-3">
          <h3 className="line-clamp-2 text-left font-heading text-sm leading-snug text-cream md:text-base">
            {formation.titre}
          </h3>
        </div>
      </Link>
    </article>
  );
}
