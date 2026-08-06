export type InscriptionStatus =
  | "en_instruction"
  | "validee"
  | "refusee"
  | "pieces_complementaires"
  | "demande"
  | "inscrit"
  | "annule";

export const ACTIVE_DEMANDE_STATUSES: InscriptionStatus[] = [
  "en_instruction",
  "demande",
  "validee",
  "inscrit",
  "pieces_complementaires",
];

export const PLACE_TAKING_STATUSES: InscriptionStatus[] = ["validee", "inscrit"];

/** Normalise les anciens statuts legacy vers le vocabulaire UI. */
export function normalizeInscriptionStatus(raw: string | null | undefined): InscriptionStatus {
  switch (raw) {
    case "demande":
      return "en_instruction";
    case "inscrit":
      return "validee";
    case "en_instruction":
    case "validee":
    case "refusee":
    case "pieces_complementaires":
    case "annule":
      return raw;
    default:
      return "en_instruction";
  }
}

export function inscriptionStatusLabel(status: InscriptionStatus): string {
  switch (normalizeInscriptionStatus(status)) {
    case "en_instruction":
      return "En cours d'instruction";
    case "validee":
      return "Validée";
    case "refusee":
      return "Refusée";
    case "pieces_complementaires":
      return "En attente de pièce complémentaire";
    case "annule":
      return "Annulée";
    default:
      return status;
  }
}

export function formatFormationDate(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
