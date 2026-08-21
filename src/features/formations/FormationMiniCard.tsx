import Link from "next/link";

import { MediaFrame } from "@/components/ui/MediaFrame";
import type { FormationData } from "@/lib/defaults";
import { formationPath } from "@/lib/defaults";
import { resolveFormationCoverUrl } from "@/lib/site-media";

export type FormationMiniCardData = Pick<
  FormationData,
  "slug" | "titre" | "titreCourt" | "coverImageUrl" | "coverImageMimeType"
>;

type FormationMiniCardProps = {
  formation: FormationMiniCardData;
};

export function FormationMiniCard({ formation }: FormationMiniCardProps) {
  const coverSrc = resolveFormationCoverUrl(formation.slug, formation.coverImageUrl);
  const href = formationPath(formation.slug);

  return (
    <article className="card-stage overflow-hidden">
      <Link
        href={href}
        aria-label={`Voir la formation ${formation.titreCourt}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or/50"
      >
        <MediaFrame
          src={coverSrc}
          mimeType={formation.coverImageMimeType ?? "image/jpeg"}
          alt=""
          aspect="video"
          sizes="(max-width: 1023px) 50vw, 25vw"
          className="rounded-none border-0"
        />
        <div className="p-2.5 md:p-3">
          <h3 className="line-clamp-2 text-left font-heading text-base leading-snug text-cream">
            {formation.titre}
          </h3>
        </div>
      </Link>
    </article>
  );
}
