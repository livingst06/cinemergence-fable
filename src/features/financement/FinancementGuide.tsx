"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  defaultFinancement,
  financementGuide,
  PUBLIC_FINANCEMENT_KEYS,
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
  const matches = defaultFinancement.filter(
    (d) => PUBLIC_FINANCEMENT_KEYS.includes(d.key) && keys.includes(d.key),
  );

  return (
    <div className="card-stage p-6 md:p-8">
      <h3 className="font-heading text-3xl leading-tight text-balance text-cream md:text-4xl">
        Quel financement pour mon&nbsp;profil&nbsp;?
      </h3>
      <p className="mt-4 text-lg leading-relaxed text-muted-text md:text-xl">
        Chaque situation est différente. On étudie avec toi les possibilités de prise en
        charge.
      </p>

      {PUBLIC_FINANCEMENT_KEYS.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {profils.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProfil(p.id)}
              className={`rounded-full border px-4 py-2.5 text-base transition-colors md:text-lg ${
                profil === p.id
                  ? "border-projector/40 bg-projector/10 text-or-light"
                  : "border-white/10 text-muted-text hover:border-white/20 hover:text-cream"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {matches.length > 0 ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {matches.map((d) => (
            <div key={d.key} className="card-stage p-5">
              <Badge className="mb-3 bg-projector text-cream">{d.titre}</Badge>
              <p className="text-lg leading-relaxed text-muted-text">{d.description}</p>
              <ol className="mt-4 space-y-2 text-lg leading-relaxed text-cream/80">
                {d.etapes.map((e, i) => (
                  <li key={e}>
                    {i + 1}. {e}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-lg leading-relaxed text-muted-text md:text-xl">
          Écris-nous : on te dit concrètement comment financer ta formation, selon ton statut
          et ton projet.
        </p>
      )}

      <div className="mt-8">
        <ButtonLink href="/contact?type=financement" className="btn-cta">
          Je vérifie mon financement
        </ButtonLink>
      </div>
    </div>
  );
}
