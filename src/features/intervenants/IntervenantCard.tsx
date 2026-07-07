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
        <Badge className="absolute right-4 top-4 z-20 border-projector/30 bg-noir/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-projector-light backdrop-blur-sm">
          Parrain
        </Badge>
      )}
      <MediaFrame
        src={intervenant.photoUrl}
        mimeType={intervenant.photoMimeType}
        alt={`Portrait — ${intervenant.nom}`}
        aspect="portrait"
        className="rounded-none border-0 border-b border-white/[0.06]"
      />
      <div className="p-6">
        <h3 className="font-heading text-2xl leading-none text-cream">{intervenant.nom}</h3>
        <p className="mt-2 text-sm font-medium text-or-light">{intervenant.role}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted-text">{intervenant.bio}</p>
        {intervenant.filmographie.length > 0 && (
          <p className="mt-4 text-xs leading-relaxed text-cool-glow">
            {intervenant.filmographie.join(" · ")}
          </p>
        )}
      </div>
    </article>
  );
}
