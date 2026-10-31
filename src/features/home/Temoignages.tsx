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

    // Pas de ResizeObserver : sur mobile il se relançait pendant le geste,
    // le navigateur réancrait la page et le scroll vers le haut saccadait
    // sans pouvoir atteindre le sommet. Une colonne n'a pas besoin de
    // hauteurs égales ; à partir de md on mesure au chargement et au resize.
    const columns = window.matchMedia("(min-width: 768px)");
    const cards = () => [...root.querySelectorAll<HTMLElement>("[data-equal-height]")];

    const apply = () => {
      const nodes = cards();
      if (!columns.matches) {
        for (const card of nodes) {
          if (card.style.minHeight) card.style.minHeight = "";
        }
        return;
      }
      for (const card of nodes) card.style.minHeight = "";
      const max = Math.ceil(
        Math.max(0, ...nodes.map((card) => card.getBoundingClientRect().height)),
      );
      const next = max > 0 ? `${max}px` : "";
      for (const card of nodes) {
        if (card.style.minHeight !== next) card.style.minHeight = next;
      }
    };

    apply();
    let lastWidth = root.getBoundingClientRect().width;
    const onResize = () => {
      const width = root.getBoundingClientRect().width;
      // La barre d'adresse mobile change la hauteur, pas la largeur.
      // Remesurer dans ce cas réancrerait le scroll et bloquerait la remontée.
      if (Math.abs(width - lastWidth) < 1) return;
      lastWidth = width;
      apply();
    };
    columns.addEventListener("change", apply);
    window.addEventListener("resize", onResize);
    const fontsReady = document.fonts?.ready.then(apply);

    return () => {
      columns.removeEventListener("change", apply);
      window.removeEventListener("resize", onResize);
      void fontsReady;
    };
  }, [temoignages]);

  return (
    <Section compact>
      <div className="container-page">
        <SectionHeader
          title="La parole aux élèves"
          align="left"
          description="Des visages, des parcours, des retours d'expérience sur nos formations."
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
              <p className="mt-3 flex-1 font-serif text-lg leading-relaxed text-cream md:text-xl">
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
