import type { TemoignageData } from "@/lib/defaults";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";

const profilLabels: Record<TemoignageData["profil"], string> = {
  debutant: "Débutant",
  reconversion: "Reconversion",
  intermittent: "Intermittent",
};

type TemoignagesProps = {
  temoignages: TemoignageData[];
};

export function Temoignages({ temoignages }: TemoignagesProps) {
  return (
    <Section>
      <div className="container-page">
        <SectionHeader
          eyebrow="Témoignages"
          title="L'avis de nos stagiaires"
          description="Six parcours, six retours d'expérience sur le stage Bande Démo Cinéma."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {temoignages.map((t, i) => (
            <Reveal key={t.auteur} delay={i * 100}>
              <blockquote className="card-stage flex h-full flex-col p-7 md:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-or-light">
                  {profilLabels[t.profil]}
                </p>
                <p className="mt-5 flex-1 text-base leading-relaxed text-cream md:text-lg">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-6 border-t border-white/[0.06] pt-5">
                  <p className="font-semibold text-cream">{t.auteur}</p>
                  <p className="mt-1 text-xs text-muted-text">{t.formation}</p>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
