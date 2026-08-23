export type PaiementStatus =
  | "paye"
  | "en_cours"
  | "annule"
  | "refuse"
  | "rembourse";

export type PaiementStripeHint = {
  status?: string | null;
  paymentStatus?: string | null;
  amountRefunded?: number | null;
  paymentIntentStatus?: string | null;
};

export type AdminPaiementRow = {
  id: string;
  inscriptionId: string | null;
  elevePrenom: string;
  eleveNom: string;
  eleveEmail: string;
  formationTitre: string;
  formationSlug: string | null;
  sessionLabel: string | null;
  amountEuros: number | null;
  paidAt: string;
  status: PaiementStatus;
};

export const PAIEMENT_STATUS_LABELS: Record<PaiementStatus, string> = {
  paye: "Payé",
  en_cours: "Paiement en cours",
  annule: "Annulé",
  refuse: "Paiement refusé",
  rembourse: "Remboursé",
};

export const PAIEMENT_STATUS_TONES: Record<PaiementStatus, string> = {
  paye: "status-badge-success",
  en_cours: "status-badge-amber",
  annule: "status-badge-muted",
  refuse: "status-badge-danger",
  rembourse: "status-badge-or",
};

export function splitEleveName(name: string | null | undefined): {
  prenom: string;
  nom: string;
} {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { prenom: "", nom: "" };
  if (parts.length === 1) return { prenom: parts[0] ?? "", nom: "" };
  return { prenom: parts[0] ?? "", nom: parts.slice(1).join(" ") };
}

function fromLocalStatus(localStatus: string | null | undefined): PaiementStatus {
  switch (localStatus) {
    case "payee":
    case "validee":
    case "inscrit":
      return "paye";
    case "en_paiement":
      return "en_cours";
    case "annule":
      return "annule";
    case "refusee":
      return "refuse";
    default:
      return "en_cours";
  }
}

export function resolvePaiementStatus(args: {
  localStatus?: string | null;
  stripe?: PaiementStripeHint | null;
}): PaiementStatus {
  const stripe = args.stripe;
  const refunded = (stripe?.amountRefunded ?? 0) > 0;
  if (refunded || stripe?.paymentIntentStatus === "refunded") {
    return "rembourse";
  }

  if (stripe) {
    const sessionStatus = stripe.status ?? "";
    const paymentStatus = stripe.paymentStatus ?? "";
    if (sessionStatus === "complete" && paymentStatus === "paid") return "paye";
    if (sessionStatus === "open") return "en_cours";
    if (sessionStatus === "complete" && paymentStatus === "unpaid") return "refuse";
    if (sessionStatus === "expired") return "annule";
  }

  return fromLocalStatus(args.localStatus);
}
