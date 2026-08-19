import type { ReactNode } from "react";

import { parseLabeledItem, sanitizePedagogyList } from "@/lib/formation-format";

type DotProps = {
  tone?: "projector" | "or";
};

function Dot({ tone = "projector" }: DotProps) {
  return (
    <span
      className={
        tone === "or"
          ? "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-or shadow-[0_0_6px_var(--or-glow)]"
          : "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-projector shadow-[0_0_6px_var(--projector-glow)]"
      }
      aria-hidden
    />
  );
}

type LabeledListProps = {
  items: string[];
  columns?: "2" | "3";
  tone?: "projector" | "or";
};

export function FormationLabeledGrid({ items, columns = "3", tone = "projector" }: LabeledListProps) {
  if (items.length === 0) return null;
  return (
    <ul
      className={
        columns === "2"
          ? "grid gap-3 sm:grid-cols-2"
          : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {items.map((item) => {
        const { label, detail } = parseLabeledItem(item);
        return (
          <li key={item} className="card-stage flex items-start gap-3 p-5">
            <Dot tone={tone} />
            <div className="min-w-0">
              <p className="font-heading text-sm uppercase tracking-wide text-cream">{label}</p>
              {detail && (
                <p className="mt-1.5 text-left md:text-justify text-sm leading-relaxed text-muted-text">{detail}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

type PedagogyProps = {
  methodes: string[];
  moyens: string[];
  encadrement?: string;
};

export function FormationPedagogy({ methodes, moyens, encadrement }: PedagogyProps) {
  const cleanMethodes = sanitizePedagogyList(methodes);
  const cleanMoyens = sanitizePedagogyList(moyens);
  if (cleanMethodes.length === 0 && cleanMoyens.length === 0 && !encadrement) {
    return null;
  }

  return (
    <div className="space-y-8 md:space-y-10">
      {cleanMethodes.length > 0 && (
        <div>
          <div className="mb-4">
            <h3 className="font-heading text-2xl text-cream md:text-3xl">
              Méthodes pédagogiques
            </h3>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            {cleanMethodes.map((m) => (
              <li
                key={m}
                className="card-stage flex items-start gap-3 px-4 py-3.5"
              >
                <Dot />
                <p className="min-w-0 flex-1 text-left md:text-justify text-sm leading-snug text-cream/90">
                  {m}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {cleanMoyens.length > 0 && (
        <div>
          <div className="mb-4">
            <h3 className="font-heading text-2xl text-cream md:text-3xl">Moyens techniques</h3>
          </div>
          <div className="space-y-3">
            {cleanMoyens.map((m) => (
              <div
                key={m}
                className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent px-5 py-4 md:px-6 md:py-5"
              >
                <span
                  className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-projector via-projector-light to-transparent"
                  aria-hidden
                />
                <p className="pl-3 text-left md:text-justify text-sm leading-relaxed text-cream/85 md:pl-4 md:text-[0.95rem] md:leading-7">
                  {m}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {encadrement && (
        <div>
          <div className="mb-4">
            <h3 className="font-heading text-2xl text-cream md:text-3xl">Encadrement</h3>
          </div>
          <div className="rounded-xl border border-or/20 bg-or/[0.06] px-5 py-4 md:px-6 md:py-5">
            <p className="text-left md:text-justify text-sm leading-relaxed text-cream/90 md:text-[0.95rem] md:leading-7">
              {encadrement}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

type ProseProps = {
  children: ReactNode;
};

export function FormationProse({ children }: ProseProps) {
  return (
    <div className="space-y-4 text-left md:text-justify text-base leading-relaxed text-muted-text md:leading-7">
      {children}
    </div>
  );
}
