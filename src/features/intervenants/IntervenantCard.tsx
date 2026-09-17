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

  if (compact) {
    return (
      <article className="group card-stage relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:plateau-glow">
        {badge ? <div className="absolute right-4 top-4 z-20">{badge}</div> : null}
        <div className="flex justify-center px-4 pt-5 md:px-5 md:pt-6">
          <MediaFrame
            src={intervenant.photoUrl}
            mimeType={intervenant.photoMimeType}
            alt={`Portrait — ${intervenant.nom}`}
            aspect="portrait"
            sizes="(max-width: 640px) 30vw, (max-width: 1280px) 16vw, 11vw"
            className="w-1/3 rounded-md border-0"
          />
        </div>
        <div className="p-4 md:p-6">
          <h3 className="font-heading text-lg leading-snug text-cream md:text-xl">{intervenant.nom}</h3>
          <p className="mt-1.5 text-sm font-medium text-or-light md:text-base">{intervenant.role}</p>
          <p className="body-copy mt-2 text-left md:mt-3 md:text-justify">{intervenant.bio}</p>
          {intervenant.filmographie.length > 0 && (
            <p className="caption-copy mt-3 text-cool-glow">
              {intervenant.filmographie.join(" · ")}
            </p>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="group card-stage relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:plateau-glow">
      {badge ? <div className="absolute right-4 top-4 z-20">{badge}</div> : null}
      <MediaFrame
        src={intervenant.photoUrl}
        mimeType={intervenant.photoMimeType}
        alt={`Portrait — ${intervenant.nom}`}
        aspect="portrait"
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="rounded-none border-0 border-b border-white/[0.06]"
      />
      <div className="p-4 md:p-6">
        <h3 className="font-heading text-xl leading-snug text-cream">{intervenant.nom}</h3>
        <p className="mt-2 text-base font-medium text-or-light">{intervenant.role}</p>
        <p className="body-copy mt-3 text-left md:mt-4 md:text-justify">{intervenant.bio}</p>
        {intervenant.filmographie.length > 0 && (
          <p className="caption-copy mt-4 text-cool-glow">
            {intervenant.filmographie.join(" · ")}
          </p>
        )}
      </div>
    </article>
  );
}
