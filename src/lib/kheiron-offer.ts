/**
 * Lien historique des 5 premières places, à 890 € TTC.
 * Plus proposé : un nouvel achat passe par le lien à 990 € TTC.
 * Les paiements déjà encaissés sur ce lien comptent encore une place.
 */
export const KHEIRON_EARLY_PAYMENT_LINK = "https://buy.stripe.com/aFadR8fWP9H18Vr5Z2bwk09";
/** Tarif unique, y compris les 4 places supplémentaires et après complet : 990 € TTC. */
export const KHEIRON_STANDARD_PAYMENT_LINK = "https://buy.stripe.com/3cI28q3a38CX5Jf9bebwk0b";

export const KHEIRON_EARLY_LIMIT = 5;
/**
 * Places payées au CO, hors Stripe, sur son compte bancaire.
 * Elles comptent dans le seuil des 5 premières places et dans la jauge.
 * Une place est déjà connue.
 */
export const KHEIRON_OFF_PROCESS_SEATS = 1;
export const KHEIRON_SESSION_CAPACITY = 20;
export const KHEIRON_EXTRA_SEATS = 4;
export const KHEIRON_TOTAL_SEATS = KHEIRON_SESSION_CAPACITY + KHEIRON_EXTRA_SEATS;

/** Identifiant d'offre, le même dans le dataLayer, Checkout et l'achat. */
export const KHEIRON_ITEM_ID = "standup-kheiron-2026-11";
export const KHEIRON_ITEM_NAME = "Masterclass Stand-Up avec Kheiron";

/** Ancien tarif des 5 premières places. Plus affiché. Les encaissements à ce montant restent valides. */
export const KHEIRON_EARLY_ONCE = "890\u00a0€\u00a0TTC";
export const KHEIRON_STANDARD_ONCE = "990\u00a0€\u00a0TTC";

/**
 * Bandeau Klarna calqué sur Ugreen : une ligne, puis l'avertissement plus petit en dessous.
 * Ne pas reformuler l'avertissement. L'exemple représentatif est dans la modale.
 */
export const KLARNA_PAY_IN_3_WARNING =
  "Attention ! Un crédit coûte de l\u2019argent et doit être remboursé.";
export const KLARNA_PAY_IN_3_EXAMPLE =
  "Exemple : montant total du crédit 200 €, taux débiteur fixe et TAEG 0 %, sans frais.";
export const KLARNA_MODAL_TITLE = "Payez à votre rythme, dès 0 % d\u2019intérêt";
export const KLARNA_MODAL_SUBTITLE =
  "Choisissez le plan de paiement le mieux adapté à votre achat";
/** Exemple représentatif du paiement en 3 fois, sur le prix affiché. */
export function klarnaRepresentativeExample(totalEuros: number): string {
  const total = formatKlarnaEuros(totalEuros);
  const installment = formatKlarnaEuros(klarnaInstallmentEuros(totalEuros));
  const credit = formatKlarnaEuros(klarnaInstallmentEuros(totalEuros) * 2);
  const fees = formatKlarnaEuros(0);
  return `Exemple du Paiement en 3 fois : prix : ${total}. Acompte : ${installment}. 2 versements de ${installment}. Montant net du crédit : ${credit}. Durée : 2 mois. Taux d\u2019intérêt nominal (TIN) fixe et TAEG : 0 %. Frais : ${fees}. Montant total dû : ${total}.`;
}
export const KLARNA_TERMS_URL = "https://www.klarna.com/fr/legal/";
export const KLARNA_SOLVENCY_BEFORE =
  "Tous les plans de paiement sont soumis à une évaluation préalable de votre solvabilité. Des ";
export const KLARNA_SOLVENCY_LINK = "conditions générales";
export const KLARNA_SOLVENCY_AFTER = " s\u2019appliquent.";

/**
 * Montants acceptés par lien Stripe, en centimes.
 * Le tarif proposé est 990 € TTC. Les anciens montants restent
 * acceptés pour qu'un paiement déjà encaissé compte encore une place.
 */
export const KHEIRON_PAYMENT_AMOUNTS: Record<string, readonly number[]> = {
  plink_1UTe7yCXL04XIOiV6iAxpnwA: [89_000, 129_000],
  plink_1UU3ceCXL04XIOiVTvg1tidi: [99_000, 149_000],
};

export type KheironOfferPhase = "early" | "standard" | "extra" | "full";

export type KheironOffer = {
  paidCount: number;
  /** Sert au calcul du complet, pas au texte public. */
  seatsLeft: number;
  phase: KheironOfferPhase;
  paymentLink: string;
};

export type KheironPrice = {
  once: string;
};

/** Tarif public unique : 990 € TTC, quelle que soit la phase. */
export function kheironPrice(phase: KheironOfferPhase): KheironPrice {
  switch (phase) {
    case "early":
    case "standard":
    case "extra":
    case "full":
      return { once: KHEIRON_STANDARD_ONCE };
  }
}

/** Montant Klarna en euros, toujours avec deux décimales : « 330,00 € ». */
export function formatKlarnaEuros(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Une échéance du paiement en 3 fois, arrondie au centime. */
export function klarnaInstallmentEuros(totalEuros: number): number {
  return Math.round((totalEuros / 3) * 100) / 100;
}

export type KlarnaPlanExample = {
  title: string;
  detail: string;
  fees: string | null;
  total: string;
};

/** Les exemples de la modale, calculés sur le prix affiché. Pas de paiement dans 30 jours. */
export function klarnaPlanExamples(totalEuros: number): KlarnaPlanExample[] {
  const total = formatKlarnaEuros(totalEuros);
  const installment = formatKlarnaEuros(klarnaInstallmentEuros(totalEuros));
  const fees = `${formatKlarnaEuros(0)} frais`;
  return [
    { title: "Payer en 3 fois", detail: `${installment} tous les 30 jours`, fees, total },
    { title: "Payer la totalité", detail: `${total} aujourd\u2019hui`, fees: null, total },
  ];
}

/** Prix TTC en euros facturé pour un nouvel achat. Toujours 990. */
export function kheironAmountEuros(phase: KheironOfferPhase): number {
  switch (phase) {
    case "early":
    case "standard":
    case "extra":
    case "full":
      return 990;
  }
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
    paymentLink: KHEIRON_STANDARD_PAYMENT_LINK,
  };
}

/**
 * Bandeau « dès la 6e place ».
 * `paidCount` est le total Stripe + hors process. Visible seulement sous 5.
 */
export function showsSixthSeatTariffNote(paidCount: number): boolean {
  const safeCount = Number.isFinite(paidCount) ? Math.max(0, Math.floor(paidCount)) : 0;
  return safeCount < KHEIRON_EARLY_LIMIT;
}

/** Compte Stripe plus les places déjà payées hors process. */
export function kheironOfferFromStripeCount(stripePaid: number): KheironOffer {
  const safeStripe = Number.isFinite(stripePaid) ? Math.max(0, Math.floor(stripePaid)) : 0;
  return kheironOfferFromCount(safeStripe + KHEIRON_OFF_PROCESS_SEATS);
}
