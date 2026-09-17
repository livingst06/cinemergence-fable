import { Badge } from "@/components/ui/badge";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { IntervenantData } from "@/lib/defaults";

type IntervenantCardProps = {
  intervenant: IntervenantData;
  /** Homepage: portrait about one-third the default card photo. */
  compact?: boolean;
};

function IntervenantBadge({ intervenant }: { intervenant: IntervenantData }) {
  if (intervenant.parrain) {
    return (
      <Badge className="border-projector/30 bg-noir/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-projector-light backdrop-blur-sm">
        Parrain
      </Badge>
    );
  }
  if (intervenant.categorie === "formateur") {
    return (
      <Badge className="border-or/30 bg-noir/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-or-light backdrop-blur-sm">
        Formateur
      </Badge>
    );
  }
  return null;
}

export function IntervenantCard({ intervenant, compact = false }: IntervenantCardProps) {
  const badge = <IntervenantBadge intervenant={intervenant} />;
  const photoClass = compact ? "w-[28%]" : "w-1/3";

  return (
    <article className="group card-stage relative w-full overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:plateau-glow">
      {badge ? <div className="absolute right-2 top-2 z-20">{badge}</div> : null}
      <div className="flex justify-center px-3 pt-3">
        <MediaFrame
          src={intervenant.photoUrl}
          mimeType={intervenant.photoMimeType}
          alt={`Portrait — ${intervenant.nom}`}
          aspect="portrait"
          sizes="(max-width: 640px) 22vw, (max-width: 1024px) 12vw, 8vw"
          className={`${photoClass} rounded-md border-0`}
        />
      </div>
      <div className="px-3 pb-3 pt-2">
        <h3 className="font-heading text-xs font-medium leading-snug tracking-normal text-cream normal-case md:text-sm">
          {intervenant.nom}
        </h3>
        <p className="mt-0.5 text-[11px] font-medium text-or-light">{intervenant.role}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-text">{intervenant.bio}</p>
        {intervenant.filmographie.length > 0 && (
          <p className="mt-1.5 text-[10px] leading-snug tracking-wide text-cool-glow">
            {intervenant.filmographie.join(" · ")}
          </p>
        )}
      </div>
    </article>
  );
}
