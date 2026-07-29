"use client";

import { useMemo, useState } from "react";

import { FormationCard } from "@/features/formations/FormationCard";
import type { FormationData } from "@/lib/defaults";
import { cn } from "@/lib/utils";

type FormationsCatalogProps = {
  formations: FormationData[];
};

type AudienceFilter = "tous" | "intermittent" | "entreprise";

const audienceLabels: Record<AudienceFilter, string> = {
  tous: "Tous publics",
  intermittent: "Intermittents",
  entreprise: "Entreprise",
};

export function FormationsCatalog({ formations }: FormationsCatalogProps) {
  const poles = useMemo(() => {
    const unique = Array.from(new Set(formations.map((f) => f.pole))).sort((a, b) =>
      a.localeCompare(b, "fr"),
    );
    return ["Tous", ...unique];
  }, [formations]);

  const [pole, setPole] = useState("Tous");
  const [audience, setAudience] = useState<AudienceFilter>("tous");

  const filtered = useMemo(() => {
    let list = formations;
    if (audience !== "tous") {
      list = list.filter((f) => f.audience === audience);
    }
    if (pole !== "Tous") {
      list = list.filter((f) => f.pole === pole);
    }
    return [...list].sort((a, b) => Number(b.prioritaire) - Number(a.prioritaire));
  }, [formations, pole, audience]);

  const featured = filtered.filter((f) => f.prioritaire);
  const others = filtered.filter((f) => !f.prioritaire);
  const ordered = [...featured, ...others];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par public">
        {(Object.keys(audienceLabels) as AudienceFilter[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={audience === key}
            onClick={() => setAudience(key)}
            className={cn(
              "rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
              audience === key
                ? "border-or/40 bg-or/15 text-cream"
                : "border-white/10 bg-transparent text-cream/70 hover:border-or/30 hover:text-or-light",
            )}
          >
            {audienceLabels[key]}
          </button>
        ))}
      </div>

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

      {ordered.length > 0 ? (
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {ordered.map((f) => (
            <FormationCard key={f.slug} formation={f} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-text">
          Aucune formation pour ce filtre pour le moment.
        </p>
      )}
    </div>
  );
}
