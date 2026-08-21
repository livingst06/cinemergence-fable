import type { ReactNode } from "react";

import { FinanceurLogo } from "@/components/brand/FinanceurLogo";
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
      <p>
        On t&apos;aide à y voir clair et à monter ton dossier.
      </p>
    );

  return (
    <Section variant="secondary">
      <div className="container-page">
        <SectionHeader eyebrow="Financement" title={title} description={descriptionNode} />
        {dispositifs.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dispositifs.map((d, i) => (
              <Reveal key={d.key} delay={i * 80}>
                <div className="card-stage flex h-full flex-col p-6">
                  <FinanceurLogo financeurKey={d.key} />
                  <h3 className="mt-4 font-heading text-xl text-or-light">{d.titre}</h3>
                  <p className="mt-2 text-left text-sm leading-relaxed text-muted-text md:text-justify">{d.description}</p>
                  <p className="mt-4 text-xs font-medium uppercase tracking-wider text-cool-glow">
                    {d.public}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
        {showCta && (
          <div className="mt-10 text-center">
            <ButtonLink
              href="/financement"
              className="btn-outline-warm rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wider"
            >
              Je vérifie mon financement
            </ButtonLink>
          </div>
        )}
      </div>
    </Section>
  );
}
