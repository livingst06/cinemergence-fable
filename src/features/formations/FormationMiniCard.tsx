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
    <article className="card-stage w-full overflow-hidden">
      <Link
        href={href}
        aria-label={`Voir la formation ${formation.titreCourt}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or/50"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <MediaFrame
            src={coverSrc}
            mimeType={formation.coverImageMimeType ?? "image/jpeg"}
            alt=""
            aspect="video"
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
            className="h-full rounded-none border-0 !aspect-auto"
          />
        </div>
        <div className="px-4 py-3.5 md:px-5 md:py-4">
          <h3 className="line-clamp-2 text-left font-heading text-[15px] font-medium leading-[1.4] tracking-normal text-cream normal-case md:text-base">
            {formation.titreCourt}
          </h3>
        </div>
      </Link>
    </article>
  );
}
