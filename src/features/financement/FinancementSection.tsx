import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";
import type { FinancementDispositif } from "@/lib/defaults";

type FinancementSectionProps = {
  dispositifs: FinancementDispositif[];
  title?: ReactNode;
  description?: ReactNode;
  showCta?: boolean;
};

export function FinancementSection({
  dispositifs,
  title = "Ton projet peut être pris en\u00a0charge",
  description,
  showCta = true,
}: FinancementSectionProps) {
  const descriptionNode =
    description ??
    (
      <div className="space-y-1">
        <p>AFDAS, OPCO, CPF, France Travail</p>
        <p>
          on t&apos;aide à y voir clair.
        </p>
      </div>
    );

  return (
    <Section variant="secondary">
      <div className="container-page">
        <SectionHeader eyebrow="Financement" title={title} description={descriptionNode} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dispositifs.map((d, i) => (
            <Reveal key={d.key} delay={i * 80}>
              <div className="card-stage h-full p-6">
                <h3 className="font-heading text-xl text-or-light">{d.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-text">{d.description}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-wider text-cool-glow">
                  {d.public}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        {showCta && (
          <div className="mt-10 text-center">
            <ButtonLink
              href="/financement"
              className="btn-outline-warm rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wider"
            >
              Quel financement pour moi ?
            </ButtonLink>
          </div>
        )}
      </div>
    </Section>
  );
}
