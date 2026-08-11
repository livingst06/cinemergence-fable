import type { FormationData } from "./formation-types";
import { formationsCatalog } from "./formations-catalog";
import { parseEurosFromTarifLabel } from "@/lib/inscription-status";

/** Places déterministes 6–14 à partir du slug (catalogue hors CMS). */
export function placesFromSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return 6 + (hash % 9);
}

/** Dates de session déterministes (catalogue hors CMS). */
export function datesFromSlug(slug: string): { dateDebut: string; dateFin: string } {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 33 + slug.charCodeAt(i)) >>> 0;
  }
  const startMin = Date.UTC(2026, 7, 16);
  const startMax = Date.UTC(2026, 11, 11);
  const spanDays = Math.floor((startMax - startMin) / (24 * 60 * 60 * 1000));
  const offset = hash % (spanDays + 1);
  const startMs = startMin + offset * 24 * 60 * 60 * 1000;
  const durationDays = 2 + (hash % 8); // 2..9
  const endMs = startMs + durationDays * 24 * 60 * 60 * 1000;
  return {
    dateDebut: new Date(startMs).toISOString().slice(0, 10),
    dateFin: new Date(endMs).toISOString().slice(0, 10),
  };
}

/** Seed / fallback catalogue — server-only usage preferred. */
export const defaultFormations: FormationData[] = formationsCatalog.map((f) => {
  const places = placesFromSlug(f.slug);
  const dates = datesFromSlug(f.slug);
  const tarifEuros = f.tarifEuros ?? parseEurosFromTarifLabel(f.tarif) ?? undefined;
  return {
    ...f,
    placesOffertes: f.placesOffertes ?? places,
    effectifMax: f.effectifMax ?? places,
    dateDebut: f.dateDebut ?? dates.dateDebut,
    dateFin: f.dateFin ?? dates.dateFin,
    tarifEuros,
  };
});
