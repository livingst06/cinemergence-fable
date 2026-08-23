import { Badge } from "@/components/ui/badge";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { IntervenantData } from "@/lib/defaults";

type IntervenantCardProps = {
  intervenant: IntervenantData;
};

export function IntervenantCard({ intervenant }: IntervenantCardProps) {
  return (
    <article className="group card-stage relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:plateau-glow">
      {intervenant.parrain && (
        <Badge className="absolute right-4 top-4 z-20 border-projector/30 bg-noir/80 px-2.5 py-1 text-xs font-semibold tracking-wide text-projector-light backdrop-blur-sm">
          Parrain
        </Badge>
      )}
      {!intervenant.parrain && intervenant.categorie === "formateur" && (
        <Badge className="absolute right-4 top-4 z-20 border-or/30 bg-noir/80 px-2.5 py-1 text-xs font-semibold tracking-wide text-or-light backdrop-blur-sm">
          Formateur
        </Badge>
      )}
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
