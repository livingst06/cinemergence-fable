/** Les 5 premiers paiements confirmés : 890 € TTC. */
export const KHEIRON_EARLY_PAYMENT_LINK = "https://buy.stripe.com/aFadR8fWP9H18Vr5Z2bwk09";
/** À partir du 6e paiement, y compris les 4 places supplémentaires et après complet : 990 € TTC. */
export const KHEIRON_STANDARD_PAYMENT_LINK = "https://buy.stripe.com/3cI28q3a38CX5Jf9bebwk0b";

export const KHEIRON_EARLY_LIMIT = 5;
export const KHEIRON_SESSION_CAPACITY = 20;
export const KHEIRON_EXTRA_SEATS = 4;
export const KHEIRON_TOTAL_SEATS = KHEIRON_SESSION_CAPACITY + KHEIRON_EXTRA_SEATS;

/** Identifiant d'offre, le même dans le dataLayer, Checkout et l'achat. */
export const KHEIRON_ITEM_ID = "standup-kheiron-2026-11";
export const KHEIRON_ITEM_NAME = "Masterclass Stand-Up avec Kheiron";

export const KHEIRON_EARLY_ONCE = "890\u00a0€\u00a0TTC";
export const KHEIRON_STANDARD_ONCE = "990\u00a0€\u00a0TTC";

/**
 * Formule au tutoiement de la page. Ne pas ajouter « sans frais », un taux ou un montant d'échéance.
 * L'avertissement, lui, reste le texte fixe Klarna, à la même taille, immédiatement à côté.
 */
export const KLARNA_PAY_IN_3_COPY = "Choisis Klarna. Paie en 3 fois.";
export const KLARNA_PAY_IN_3_WARNING =
  "Attention ! Un crédit coûte de l\u2019argent et doit être remboursé.";

/**
 * Montants acceptés par lien Stripe, en centimes.
 * Le tarif en vigueur est 890 € puis 990 €. Les anciens montants restent
 * acceptés pour qu'un paiement déjà encaissé compte encore une place.
 */
export const KHEIRON_PAYMENT_AMOUNTS: Record<string, readonly number[]> = {
  plink_1UTe7yCXL04XIOiV6iAxpnwA: [89_000, 129_000],
  plink_1UU3ceCXL04XIOiVTvg1tidi: [99_000, 149_000],
};

export type KheironOfferPhase = "early" | "standard" | "extra" | "full";

export type KheironOffer = {
  paidCount: number;
  /** Sert au calcul du tarif et du complet, pas au texte public. */
  seatsLeft: number;
  phase: KheironOfferPhase;
  paymentLink: string;
};

export type KheironPrice = {
  once: string;
};

export function kheironPrice(phase: KheironOfferPhase): KheironPrice {
  if (phase === "early") return { once: KHEIRON_EARLY_ONCE };
  return { once: KHEIRON_STANDARD_ONCE };
}

/** Prix TTC en euros de la phase en cours. 890 pour les 5 premières places, 990 ensuite. */
export function kheironAmountEuros(phase: KheironOfferPhase): number {
  return phase === "early" ? 890 : 990;
}

export function isKheironPaymentAmount(linkId: string, amountTotal: number | null | undefined) {
  const expected = KHEIRON_PAYMENT_AMOUNTS[linkId];
  return expected !== undefined && amountTotal != null && expected.includes(amountTotal);
}

export function kheironOfferFromCount(paidCount: number): KheironOffer {
  const safeCount = Number.isFinite(paidCount) ? Math.max(0, Math.floor(paidCount)) : 0;
  if (safeCount >= KHEIRON_TOTAL_SEATS) {
    return {
      paidCount: safeCount,
      seatsLeft: 0,
      phase: "full",
      paymentLink: KHEIRON_STANDARD_PAYMENT_LINK,
    };
  }
  if (safeCount >= KHEIRON_SESSION_CAPACITY) {
    return {
      paidCount: safeCount,
      seatsLeft: KHEIRON_TOTAL_SEATS - safeCount,
      phase: "extra",
      paymentLink: KHEIRON_STANDARD_PAYMENT_LINK,
    };
  }
  const seatsLeft = KHEIRON_SESSION_CAPACITY - safeCount;
  if (safeCount >= KHEIRON_EARLY_LIMIT) {
    return {
      paidCount: safeCount,
      seatsLeft,
      phase: "standard",
      paymentLink: KHEIRON_STANDARD_PAYMENT_LINK,
    };
  }
  return {
    paidCount: safeCount,
    seatsLeft,
    phase: "early",
    paymentLink: KHEIRON_EARLY_PAYMENT_LINK,
  };
}
