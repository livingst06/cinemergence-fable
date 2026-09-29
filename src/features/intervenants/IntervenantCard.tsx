import { Badge } from "@/components/ui/badge";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { IntervenantData } from "@/lib/defaults";

type IntervenantCardProps = {
  intervenant: IntervenantData;
  /** Conservé pour compat — toutes les cards ont désormais le même format. */
  compact?: boolean;
};

function IntervenantBadge({ intervenant }: { intervenant: IntervenantData }) {
  if (intervenant.parrain) {
    return (
      <Badge className="h-auto border-projector/30 bg-noir/80 px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.14em] text-projector-light backdrop-blur-sm md:text-base">
        Parrain
      </Badge>
    );
  }
  if (intervenant.categorie === "formateur") {
    return (
      <Badge className="h-auto border-or/30 bg-noir/80 px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.14em] text-or-light backdrop-blur-sm md:text-base">
        Formateur
      </Badge>
    );
  }
  return null;
}

export function IntervenantCard({ intervenant }: IntervenantCardProps) {
  const badge = <IntervenantBadge intervenant={intervenant} />;

  return (
    <article className="group relative w-full overflow-hidden bg-noir-secondary transition-all duration-500 hover:plateau-glow">
      {badge ? <div className="absolute right-2 top-2 z-20 md:right-3 md:top-3">{badge}</div> : null}
      <MediaFrame
        src={intervenant.photoUrl}
        mimeType={intervenant.photoMimeType}
        alt={`Portrait — ${intervenant.nom}`}
        aspect="portrait"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="rounded-none border-0"
      />
      <div className="flex flex-col gap-2.5 px-5 pb-6 pt-5 text-left md:gap-3 md:px-6 md:pb-7 md:pt-6">
        <h3 className="font-heading text-lg font-semibold uppercase leading-snug tracking-[0.06em] text-cream md:text-xl">
          {intervenant.nom}
        </h3>
        <p className="text-left text-base font-medium leading-snug text-convert md:text-lg">{intervenant.role}</p>
        <p className="body-copy text-left">{intervenant.bio}</p>
        {intervenant.filmographie.length > 0 && (
          <p className="text-left text-sm leading-relaxed tracking-wide text-cool-glow md:text-base">
            {intervenant.filmographie.join(" · ")}
          </p>
        )}
      </div>
    </article>
  );
}
