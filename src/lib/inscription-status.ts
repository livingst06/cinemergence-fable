export type InscriptionStatus =
  | "en_instruction"
  | "en_paiement"
  | "payee"
  | "validee"
  | "refusee"
  | "pieces_complementaires"
  | "demande"
  | "inscrit"
  | "annule";

/** Bloque une nouvelle demande / hold pour le même couple user×formation. */
export const ACTIVE_DEMANDE_STATUSES: InscriptionStatus[] = [
  "en_instruction",
  "en_paiement",
  "payee",
  "demande",
  "validee",
  "inscrit",
  "pieces_complementaires",
];

/** Statuts qui consomment une place (hold + confirmés). */
export const PLACE_TAKING_STATUSES: InscriptionStatus[] = [
  "en_paiement",
  "payee",
  "validee",
  "inscrit",
];

/** Durée du hold paiement (min. Stripe Checkout expires_at = 30 min). */
export const HOLD_TTL_MINUTES = 30;

/** Normalise les anciens statuts legacy vers le vocabulaire UI. */
export function normalizeInscriptionStatus(raw: string | null | undefined): InscriptionStatus {
  switch (raw) {
    case "demande":
      return "en_instruction";
    case "inscrit":
      return "validee";
    case "en_instruction":
    case "en_paiement":
    case "payee":
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
    case "en_paiement":
      return "Paiement en cours";
    case "payee":
      return "Inscrit";
    case "validee":
      return "Inscrit";
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

/** Extrait un montant entier en euros depuis un libellé (« 1 400 € » → 1400). */
export function parseEurosFromTarifLabel(tarif: string | null | undefined): number | null {
  if (!tarif) return null;
  const digits = tarif.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

export function formatEurosLabel(euros: number): string {
  return `${euros.toLocaleString("fr-FR")} €`;
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

/**
 * Libellé session unique pour l’UI : « Session du 18 au 21 septembre 2026 ».
 * Ne pas afficher en parallèle un `label` ISO du type « Session 2026-09-18 → … ».
 */
export function formatFormationSessionLabel(
  dateDebut?: string,
  dateFin?: string,
  options?: SessionRangeOptions,
): string | null {
  const range = formatFormationSessionRange(dateDebut, dateFin, {
    ...options,
    capitalize: false,
  });
  if (range) return `Session ${range}`;

  const debut = formatFormationDate(dateDebut);
  if (debut) return `Session à partir du ${debut}`;

  const fin = formatFormationDate(dateFin);
  if (fin) return `Session jusqu’au ${fin}`;

  return null;
}

/** Label auto Payload « Session 2026-09-18 → 2026-09-21 » (redondant avec le libellé FR). */
export function isGeneratedSessionLabel(label: string | null | undefined): boolean {
  if (!label) return false;
  return /^Session\s+\d{4}-\d{2}-\d{2}\s*→\s*\d{4}-\d{2}-\d{2}$/i.test(label.trim());
}
