"use client";

import { useMemo, useState } from "react";

import { FormationCard } from "@/features/formations/FormationCard";
import type { FormationData } from "@/lib/defaults";
import { cn } from "@/lib/utils";

type FormationsCatalogProps = {
  formations: FormationData[];
};

export function FormationsCatalog({ formations }: FormationsCatalogProps) {
  const poles = useMemo(() => {
    const unique = Array.from(new Set(formations.map((f) => f.pole))).sort((a, b) =>
      a.localeCompare(b, "fr"),
    );
    return ["Tous", ...unique];
  }, [formations]);

  const [pole, setPole] = useState("Tous");

  const filtered = useMemo(() => {
    const list = pole === "Tous" ? formations : formations.filter((f) => f.pole === pole);
    return [...list].sort((a, b) => Number(b.prioritaire) - Number(a.prioritaire));
  }, [formations, pole]);

  const featured = filtered.filter((f) => f.prioritaire);
  const others = filtered.filter((f) => !f.prioritaire);

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par pôle">
        {poles.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={pole === p}
            onClick={() => setPole(p)}
            className={cn(
              "rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
              pole === p
                ? "border-projector/40 bg-projector/15 text-cream"
                : "border-white/10 bg-transparent text-cream/70 hover:border-or/30 hover:text-or-light",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {featured.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {featured.map((f) => (
            <FormationCard key={f.slug} formation={f} featured />
          ))}
        </div>
      )}

      {others.length > 0 && (
        <div
          className={cn(
            "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
            featured.length > 0 && "mt-6",
          )}
        >
          {others.map((f) => (
            <FormationCard key={f.slug} formation={f} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-muted-text">Aucune formation dans ce pôle pour le moment.</p>
      )}
    </div>
  );
}
