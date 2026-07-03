"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  defaultFinancement,
  financementGuide,
} from "@/lib/defaults";

const profils = [
  { id: "debutant", label: "Je débute dans le cinéma" },
  { id: "reconversion", label: "Je suis en reconversion" },
  { id: "intermittent", label: "Je suis intermittent du spectacle" },
  { id: "salarie", label: "Je suis salarié(e)" },
] as const;

export function FinancementGuide() {
  const [profil, setProfil] = useState<string>("debutant");
  const keys = financementGuide[profil] ?? [];
  const matches = defaultFinancement.filter((d) => keys.includes(d.key));

  return (
    <div className="card-stage p-6 md:p-8">
      <h3 className="font-heading text-2xl text-cream">Quel financement pour mon profil ?</h3>
      <p className="mt-2 text-sm text-muted-text">
        Sélectionne ta situation pour voir les dispositifs adaptés.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {profils.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setProfil(p.id)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              profil === p.id
                ? "border-projector/40 bg-projector/10 text-or-light"
                : "border-white/10 text-muted-text hover:border-white/20 hover:text-cream"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {matches.map((d) => (
          <div key={d.key} className="card-stage p-5">
            <Badge className="mb-3 bg-projector text-cream">{d.titre}</Badge>
            <p className="text-sm text-muted-text">{d.description}</p>
            <ol className="mt-4 space-y-2 text-sm text-cream/80">
              {d.etapes.map((e, i) => (
                <li key={e}>
                  {i + 1}. {e}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <ButtonLink href="/contact?type=financement" className="btn-cta">
          Je veux vérifier mon financement
        </ButtonLink>
      </div>
    </div>
  );
}
