import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { FormationData } from "@/lib/defaults";
import { cn } from "@/lib/utils";

type FormationCardProps = {
  formation: FormationData;
  featured?: boolean;
};

export function FormationCard({ formation, featured }: FormationCardProps) {
  return (
    <article
      className={cn(
        "group card-stage flex flex-col transition-all duration-500 hover:-translate-y-1 hover:plateau-glow",
        featured && "md:grid md:grid-cols-2 md:gap-0",
      )}
    >
      <div className="relative overflow-hidden">
        <MediaFrame
          src={formation.coverImageUrl}
          mimeType={formation.coverImageMimeType}
          alt={`Plateau — ${formation.titreCourt}`}
          aspect={featured ? "wide" : "video"}
          className={cn("rounded-none border-0 border-b border-white/[0.06]", featured && "md:aspect-auto md:h-full md:min-h-[260px]")}
        />
        {formation.prioritaire && (
          <span className="absolute left-4 top-4 rounded-full bg-projector px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream shadow-lg">
            Prioritaire
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <Badge variant="outline" className="mb-3 w-fit border-or/25 bg-or/5 text-or-light">
          {formation.pole}
        </Badge>
        <h3 className="font-heading text-[clamp(1.5rem,3vw,2rem)] leading-none text-cream">
          {formation.titre}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-text">
          {formation.accroche}
        </p>
        <p className="mt-4 border-t border-white/[0.06] pt-4 text-xs font-medium uppercase tracking-[0.15em] text-or-light">
          Livrable · {formation.livrable}
        </p>
        <ButtonLink
          href={`/${formation.slug}`}
          variant="ghost"
          className="mt-5 w-fit px-0 text-or-light hover:bg-transparent hover:text-projector-light"
        >
          Découvrir
          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </ButtonLink>
      </div>
    </article>
  );
}
