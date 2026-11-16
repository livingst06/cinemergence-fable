import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { IntervenantData } from "@/lib/defaults";
import { cn } from "@/lib/utils";

type IntervenantCardProps = {
  intervenant: IntervenantData;
  /** Conservé pour compat — toutes les cards ont désormais le même format. */
  compact?: boolean;
  /** Boutons admin, posés sur la même carte. */
  actions?: ReactNode;
};

function IntervenantBadge({ intervenant }: { intervenant: IntervenantData }) {
  if (intervenant.parrain) {
    return (
      <Badge className="h-auto border-projector/30 bg-noir/80 px-3 py-1.5 text-sm font-semibold text-projector-light backdrop-blur-sm md:text-base">
        Parrain
      </Badge>
    );
  }
  if (intervenant.categorie === "formateur") {
    return (
      <Badge className="h-auto border-or/30 bg-noir/80 px-3 py-1.5 text-sm font-semibold text-or-light backdrop-blur-sm md:text-base">
        Formateur
      </Badge>
    );
  }
  return null;
}

export const intervenantCardWidthClass = "w-[22rem] max-w-full shrink-0";

export function IntervenantCard({
  intervenant,
  actions,
  className,
}: IntervenantCardProps & { className?: string }) {
  const badge = <IntervenantBadge intervenant={intervenant} />;

  return (
    <article className={cn(intervenantCardWidthClass, "group relative", className)}>
      {actions}
      <div className="h-full overflow-hidden rounded-2xl bg-noir-secondary transition-all duration-500 group-hover:plateau-glow">
        <div className="relative w-full">
          {badge ? <div className="absolute right-2 top-2 z-20">{badge}</div> : null}
          <MediaFrame
            src={intervenant.photoUrl}
            mimeType={intervenant.photoMimeType}
            alt={`Portrait — ${intervenant.nom}`}
            aspect="portrait"
            sizes="(max-width: 640px) 75vw, (max-width: 1024px) 38vw, 25vw"
            className="aspect-[9/8] w-full border-0"
            imageClassName="object-[center_15%]"
          />
        </div>
        <div className="flex flex-col gap-2.5 px-5 pb-6 pt-5 text-left md:gap-3 md:px-6 md:pb-7 md:pt-6">
          <h3 className="break-words font-heading text-lg font-semibold leading-snug text-cream md:text-xl">
            {intervenant.nom}
          </h3>
          <p className="text-left text-base font-medium leading-snug text-convert md:text-lg">{intervenant.role}</p>
          <p className="text-left text-sm leading-relaxed text-muted-text">{intervenant.bio}</p>
          {intervenant.filmographie.length > 0 && (
            <p className="text-left text-sm leading-relaxed text-cool-glow md:text-base">
              {intervenant.filmographie.join(" · ")}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
