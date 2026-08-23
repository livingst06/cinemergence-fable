"use client";

import { useLayoutEffect, useRef } from "react";

import type { TemoignageData } from "@/lib/defaults";
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
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = gridRef.current;
    if (!root) return;

    const cards = () => [...root.querySelectorAll<HTMLElement>("[data-equal-height]")];

    const apply = () => {
      const nodes = cards();
      observer.disconnect();
      nodes.forEach((card) => {
        card.style.minHeight = "";
      });
      const max = Math.max(0, ...nodes.map((card) => card.offsetHeight));
      if (max > 0) {
        nodes.forEach((card) => {
          card.style.minHeight = `${max}px`;
        });
      }
      observer.observe(root);
    };

    const observer = new ResizeObserver(apply);
    apply();
    return () => observer.disconnect();
  }, [temoignages]);

  return (
    <Section>
      <div className="container-page">
        <SectionHeader
          eyebrow="Témoignages"
          title="L'avis de nos élèves"
          align="left"
          description="Six parcours, six retours d'expérience sur nos formations."
        />
        <div
          ref={gridRef}
          className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3"
        >
          {temoignages.map((t) => (
            <article
              key={t.auteur}
              data-equal-height
              className="card-stage flex h-full flex-col p-4 md:p-5"
            >
              <p className="eyebrow">{profilLabels[t.profil]}</p>
              <p className="mt-3 flex-1 text-base leading-relaxed text-cream md:text-lg">
                &ldquo;{t.quote.trim()}&rdquo;
              </p>
              <div className="mt-3 border-t border-white/[0.06] pt-3">
                <p className="text-base font-semibold leading-snug text-cream">{t.auteur}</p>
                {t.formation.trim() ? (
                  <p className="caption-copy mt-0.5">{t.formation.trim()}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
