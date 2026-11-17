import { describe, expect, it } from "vitest";

import { isKheironCheckout, isPaidKheironSession } from "@/lib/kheiron-checkout";
import {
  KHEIRON_EARLY_ONCE,
  KHEIRON_EARLY_PAYMENT_LINK,
  KHEIRON_ITEM_ID,
  KHEIRON_STANDARD_ONCE,
  KHEIRON_STANDARD_PAYMENT_LINK,
  KLARNA_PAY_IN_3_EXAMPLE,
  KLARNA_PAY_IN_3_WARNING,
  formatKlarnaEuros,
  kheironAmountEuros,
  klarnaInstallmentEuros,
  klarnaPlanExamples,
  klarnaRepresentativeExample,
  kheironOfferFromCount,
  kheironOfferFromStripeCount,
  kheironPrice,
  showsSixthSeatTariffNote,
} from "@/lib/kheiron-offer";

const earlyPaid = {
  livemode: true,
  mode: "payment",
  status: "complete",
  payment_status: "paid",
  currency: "eur",
  amount_total: 89_000,
  payment_link: "plink_1UTe7yCXL04XIOiV6iAxpnwA",
};

describe("isPaidKheironSession", () => {
  it("accepte le premier lien à 890 €, et encore un paiement déjà encaissé à 1 290 €", () => {
    expect(isPaidKheironSession(earlyPaid)).toBe(true);
    expect(isPaidKheironSession({ ...earlyPaid, amount_total: 129_000 })).toBe(true);
  });

  it("accepte le second lien à 990 €, et encore un paiement déjà encaissé à 1 490 €", () => {
    expect(
      isPaidKheironSession({
        ...earlyPaid,
        amount_total: 99_000,
        payment_link: "plink_1UU3ceCXL04XIOiVTvg1tidi",
      }),
    ).toBe(true);
    expect(
      isPaidKheironSession({
        ...earlyPaid,
        amount_total: 149_000,
        payment_link: "plink_1UU3ceCXL04XIOiVTvg1tidi",
      }),
    ).toBe(true);
  });

  it("refuse un autre lien, un montant qui n'est pas celui du lien, un impayé ou le mode test", () => {
    expect(isPaidKheironSession({ ...earlyPaid, payment_link: "plink_autre" })).toBe(false);
    expect(isPaidKheironSession({ ...earlyPaid, amount_total: 99_000 })).toBe(false);
    expect(isPaidKheironSession({ ...earlyPaid, amount_total: 149_000 })).toBe(false);
    expect(isPaidKheironSession({ ...earlyPaid, payment_status: "unpaid" })).toBe(false);
    expect(isPaidKheironSession({ ...earlyPaid, status: "open" })).toBe(false);
    expect(isPaidKheironSession({ ...earlyPaid, livemode: false })).toBe(false);
    expect(isPaidKheironSession({ ...earlyPaid, payment_link: { id: "plink_autre" } })).toBe(false);
  });

  it("compte une session créée par le site, même avec une réduction, pas en mode test", () => {
    const site = {
      livemode: true,
      mode: "payment",
      status: "complete",
      payment_status: "paid",
      currency: "eur",
      amount_total: 79_000,
      metadata: { offer: KHEIRON_ITEM_ID },
    };
    expect(isPaidKheironSession(site)).toBe(true);
    expect(isKheironCheckout(site)).toBe(true);
    expect(isPaidKheironSession({ ...site, livemode: false })).toBe(false);
    expect(isKheironCheckout({ ...site, livemode: false })).toBe(true);
    expect(isPaidKheironSession({ ...site, metadata: { offer: "autre" } })).toBe(false);
  });

  it("accepte le lien quand Stripe le renvoie comme objet", () => {
    expect(
      isPaidKheironSession({
        ...earlyPaid,
        payment_link: { id: "plink_1UTe7yCXL04XIOiV6iAxpnwA" },
      }),
    ).toBe(true);
  });
});

describe("kheironOfferFromCount", () => {
  it("garde la phase des 5 premières places, au lien 990 €, et le compteur sur 20", () => {
    expect(kheironOfferFromCount(0)).toMatchObject({
      paidCount: 0,
      seatsLeft: 20,
      phase: "early",
      paymentLink: KHEIRON_STANDARD_PAYMENT_LINK,
    });
    expect(kheironOfferFromCount(4)).toMatchObject({
      seatsLeft: 16,
      phase: "early",
      paymentLink: KHEIRON_STANDARD_PAYMENT_LINK,
    });
    expect(kheironOfferFromCount(0).paymentLink).not.toBe(KHEIRON_EARLY_PAYMENT_LINK);
  });

  it("passe à 990 € de la 6e à la 20e place, avec le même lien Stripe", () => {
    expect(kheironOfferFromCount(5)).toMatchObject({
      seatsLeft: 15,
      phase: "standard",
      paymentLink: KHEIRON_STANDARD_PAYMENT_LINK,
    });
    expect(kheironOfferFromCount(19)).toMatchObject({
      seatsLeft: 1,
      phase: "standard",
      paymentLink: KHEIRON_STANDARD_PAYMENT_LINK,
    });
  });

  it("ouvre 4 places supplémentaires à partir de la 20e place achetée", () => {
    expect(kheironOfferFromCount(20)).toMatchObject({
      seatsLeft: 4,
      phase: "extra",
      paymentLink: KHEIRON_STANDARD_PAYMENT_LINK,
    });
    expect(kheironOfferFromCount(23)).toMatchObject({
      seatsLeft: 1,
      phase: "extra",
      paymentLink: KHEIRON_STANDARD_PAYMENT_LINK,
    });
  });

  it("fige le compteur à complet dès 24 places, sans le décrémenter ensuite", () => {
    const full = kheironOfferFromCount(24);
    expect(full).toMatchObject({
      paidCount: 24,
      seatsLeft: 0,
      phase: "full",
      paymentLink: KHEIRON_STANDARD_PAYMENT_LINK,
    });
    expect(kheironOfferFromCount(34)).toMatchObject({
      paidCount: 34,
      seatsLeft: 0,
      phase: "full",
      paymentLink: KHEIRON_STANDARD_PAYMENT_LINK,
    });
  });
});

describe("kheironOfferFromStripeCount", () => {
  it("ajoute les places payées hors Stripe avant de choisir la phase", () => {
    expect(kheironOfferFromStripeCount(0)).toMatchObject({
      paidCount: 1,
      seatsLeft: 19,
      phase: "early",
      paymentLink: KHEIRON_STANDARD_PAYMENT_LINK,
    });
    expect(kheironOfferFromStripeCount(3)).toMatchObject({
      paidCount: 4,
      phase: "early",
    });
    expect(showsSixthSeatTariffNote(kheironOfferFromStripeCount(3).paidCount)).toBe(true);
    expect(kheironOfferFromStripeCount(4)).toMatchObject({
      paidCount: 5,
      seatsLeft: 15,
      phase: "standard",
      paymentLink: KHEIRON_STANDARD_PAYMENT_LINK,
    });
    expect(showsSixthSeatTariffNote(kheironOfferFromStripeCount(4).paidCount)).toBe(false);
    expect(kheironOfferFromStripeCount(5)).toMatchObject({
      paidCount: 6,
      phase: "standard",
    });
    expect(kheironOfferFromStripeCount(23)).toMatchObject({
      paidCount: 24,
      seatsLeft: 0,
      phase: "full",
    });
  });
});

describe("kheironPrice", () => {
  it("affiche un seul prix, 990 € TTC, y compris avant la 6e place", () => {
    expect(kheironPrice("early")).toEqual({ once: KHEIRON_STANDARD_ONCE });
    expect(kheironPrice("early").once).not.toBe(KHEIRON_EARLY_ONCE);
    expect(kheironPrice("standard")).toEqual({ once: KHEIRON_STANDARD_ONCE });
    expect(kheironPrice("extra")).toEqual(kheironPrice("standard"));
    expect(kheironPrice("full")).toEqual(kheironPrice("standard"));
  });

  it("détaille 3 paiements de 330 € et garde l'avertissement Klarna", () => {
    expect(klarnaInstallmentEuros(990)).toBe(330);
    expect(formatKlarnaEuros(330)).toMatch(/^330,00\s€$/);
    expect(klarnaPlanExamples(990)).toEqual([
      {
        title: "Payer en 3 fois",
        detail: `${formatKlarnaEuros(330)} tous les 30 jours`,
        fees: `${formatKlarnaEuros(0)} frais`,
        total: formatKlarnaEuros(990),
      },
      {
        title: "Payer la totalité",
        detail: `${formatKlarnaEuros(990)} aujourd\u2019hui`,
        fees: null,
        total: formatKlarnaEuros(990),
      },
    ]);
    expect(klarnaPlanExamples(990).some((plan) => plan.detail.includes("dans 30 jours"))).toBe(
      false,
    );
    expect(KLARNA_PAY_IN_3_WARNING).toBe(
      "Attention ! Un crédit coûte de l\u2019argent et doit être remboursé.",
    );
    expect(KLARNA_PAY_IN_3_EXAMPLE).toBe(
      "Exemple : montant total du crédit 200 €, taux débiteur fixe et TAEG 0 %, sans frais.",
    );
    const example = klarnaRepresentativeExample(990);
    expect(example).toContain(`prix : ${formatKlarnaEuros(990)}`);
    expect(example).toContain(`Acompte : ${formatKlarnaEuros(330)}`);
    expect(example).toContain(`2 versements de ${formatKlarnaEuros(330)}`);
    expect(example).toContain(`Montant net du crédit : ${formatKlarnaEuros(660)}`);
    expect(example).toContain(`Frais : ${formatKlarnaEuros(0)}`);
    expect(example).toContain(`Montant total dû : ${formatKlarnaEuros(990)}`);
    expect(example).not.toContain("300,00");
    expect(example).not.toContain("100,00");
  });

  it("facture 990 €, y compris avant la 6e place", () => {
    expect(kheironAmountEuros("early")).toBe(990);
    expect(kheironAmountEuros("standard")).toBe(990);
    expect(kheironAmountEuros("extra")).toBe(990);
    expect(kheironAmountEuros("full")).toBe(990);
  });
});
