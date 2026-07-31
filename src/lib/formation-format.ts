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
