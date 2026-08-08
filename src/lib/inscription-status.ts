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

type SessionRangeOptions = {
  /** `long` (septembre) pour les fiches ; `short` (sept.) pour les cards. */
  month?: "long" | "short";
  /** Préfixe « Du » (défaut) ou « du ». */
  capitalize?: boolean;
};

/**
 * Plage de session FR, sans répéter mois/année inutiles.
 * - même mois : « Du 26 au 28 septembre 2026 »
 * - même année : « Du 26 septembre au 3 octobre 2026 »
 * - années différentes : « Du 27 décembre 2026 au 2 janvier 2027 »
 */
export function formatFormationSessionRange(
  dateDebut?: string,
  dateFin?: string,
  options?: SessionRangeOptions,
): string | null {
  if (!dateDebut || !dateFin) return null;
  const start = new Date(dateDebut);
  const end = new Date(dateFin);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  const monthStyle = options?.month ?? "short";
  const prefix = options?.capitalize === false ? "du" : "Du";
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  const day = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "numeric" });

  const monthName = (d: Date) => {
    const raw = d.toLocaleDateString("fr-FR", { month: monthStyle });
    return monthStyle === "short" ? raw.replace(/\.$/, "") : raw;
  };

  if (sameMonth) {
    return `${prefix} ${day(start)} au ${day(end)} ${monthName(end)} ${end.getFullYear()}`;
  }
  if (sameYear) {
    return `${prefix} ${day(start)} ${monthName(start)} au ${day(end)} ${monthName(end)} ${end.getFullYear()}`;
  }
  return `${prefix} ${day(start)} ${monthName(start)} ${start.getFullYear()} au ${day(end)} ${monthName(end)} ${end.getFullYear()}`;
}

/** Libellé session : plage intelligente, ou date de début/fin seule. */
export function formatFormationSessionLabel(
  dateDebut?: string,
  dateFin?: string,
  options?: SessionRangeOptions,
): string | null {
  const range = formatFormationSessionRange(dateDebut, dateFin, options);
  if (range) return range;

  const debut = formatFormationDate(dateDebut);
  if (debut) return `Début le ${debut}`;

  const fin = formatFormationDate(dateFin);
  if (fin) return `Jusqu’au ${fin}`;

  return null;
}
