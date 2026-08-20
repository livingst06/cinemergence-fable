/** Strip Qualiopi section dumps that sometimes leak into list fields. */
export function sanitizePedagogyList(items: string[] | undefined | null): string[] {
  if (!items?.length) return [];
  const out: string[] = [];
  for (const raw of items) {
    const item = String(raw).replace(/^·\s*/, "").trim();
    if (!item) continue;
    // Numbered Qualiopi headings (e.g. "5. Compétences visées") start a dump.
    if (/^\d+\.\s+\S/.test(item)) break;
    out.push(item);
  }
  return out;
}

/** Truncate encadrement prose when a Qualiopi dump was concatenated mid-string. */
export function sanitizeEncadrement(text: string | undefined | null): string | undefined {
  if (!text) return undefined;
  const value = text.trim();
  const cut = value.search(
    /\s\d+\.\s+(Objectifs|Compétences|Programme|Méthodes|Moyens|Encadrement|Contexte)\b/i,
  );
  if (cut > 60) return value.slice(0, cut).trim();
  return value;
}

/** Split "Label : detail" or "Label — detail" for scannable UI. */
export function parseLabeledItem(text: string): { label: string; detail?: string } {
  const cleaned = text.replace(/^·\s*/, "").trim();
  const match = cleaned.match(/^([^:—–-]{2,80}?)\s*[:—–-]\s+(.+)$/);
  if (!match) return { label: cleaned };
  return { label: match[1].trim(), detail: match[2].trim() };
}

/** Split "21 heures — 3 journées de 7 heures" into title + subtitle. */
export function splitDuree(
  duree: string,
  heures?: number,
  jours?: number,
): { title: string; subtitle?: string } {
  const parsed = parseLabeledItem(duree);
  if (parsed.detail) return { title: parsed.label, subtitle: parsed.detail };

  const spaced = duree.match(/^(\d+\s*heures?)\s+(.+)$/i);
  if (spaced) return { title: spaced[1], subtitle: spaced[2] };

  if (heures != null) {
    return {
      title: `${heures} heure${heures > 1 ? "s" : ""}`,
      subtitle:
        jours != null
          ? `${jours} journée${jours > 1 ? "s" : ""} de 7 heures`
          : undefined,
    };
  }

  return { title: duree };
}

type FormationTilesSource = {
  duree: string;
  dureeHeures?: number;
  dureeJours?: number;
  format: string;
  tarif: string | null;
  effectifMax?: number;
  publicCible: string;
};

export type FormationTileBullet = {
  label: string;
  value: string;
};

/** Compact bullets mirroring the 5 stats tiles on a formation detail page. */
export function summarizeFormationTiles(
  formation: FormationTilesSource,
): FormationTileBullet[] {
  const duree = splitDuree(formation.duree, formation.dureeHeures, formation.dureeJours);
  const bullets: FormationTileBullet[] = [
    {
      label: "Durée",
      value: duree.subtitle ? `${duree.title} — ${duree.subtitle}` : duree.title,
    },
    { label: "Format", value: formation.format },
    { label: "Tarif", value: formation.tarif ?? "À confirmer" },
  ];
  if (formation.effectifMax != null) {
    bullets.push({
      label: "Places",
      value: `${formation.effectifMax} places max par session`,
    });
  }
  bullets.push({ label: "Public", value: summarizePublicCible(formation.publicCible) });
  return bullets;
}

function summarizePublicCible(publicCible: string): string {
  const primary = publicCible.split(";")[0]?.trim() || publicCible.trim();
  if (primary.length <= 88) return primary;
  const slice = primary.slice(0, 88);
  const at = slice.lastIndexOf(" ");
  return `${(at > 48 ? slice.slice(0, at) : slice).trimEnd()}…`;
}
