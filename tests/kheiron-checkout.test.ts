import { describe, expect, it } from "vitest";

import { isKheironCheckout, isPaidKheironSession } from "@/lib/kheiron-checkout";
import {
  KHEIRON_EARLY_PAYMENT_LINK,
  KHEIRON_ITEM_ID,
  KHEIRON_STANDARD_PAYMENT_LINK,
  KLARNA_PAY_IN_3_COPY,
  KLARNA_PAY_IN_3_WARNING,
  kheironAmountEuros,
  kheironOfferFromCount,
  kheironPrice,
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
  it("garde le tarif des 5 premières places et le compteur sur 20", () => {
    expect(kheironOfferFromCount(0)).toMatchObject({
      paidCount: 0,
      seatsLeft: 20,
      phase: "early",
      paymentLink: KHEIRON_EARLY_PAYMENT_LINK,
    });
    expect(kheironOfferFromCount(4)).toMatchObject({
      seatsLeft: 16,
      phase: "early",
      paymentLink: KHEIRON_EARLY_PAYMENT_LINK,
    });
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

describe("kheironPrice", () => {
  it("affiche le prix comptant, 890 € TTC puis 990 € TTC", () => {
    expect(kheironPrice("early")).toEqual({ once: "890\u00a0€\u00a0TTC" });
    expect(kheironPrice("standard")).toEqual({ once: "990\u00a0€\u00a0TTC" });
    expect(kheironPrice("extra")).toEqual(kheironPrice("standard"));
    expect(kheironPrice("full")).toEqual(kheironPrice("standard"));
  });

  it("garde la formule au tutoiement et l'avertissement Klarna", () => {
    expect(KLARNA_PAY_IN_3_COPY).toBe("Choisis Klarna. Paie en 3 fois.");
    expect(KLARNA_PAY_IN_3_WARNING).toBe(
      "Attention ! Un crédit coûte de l\u2019argent et doit être remboursé.",
    );
  });

  it("donne le montant en euros de la phase, 890 puis 990", () => {
    expect(kheironAmountEuros("early")).toBe(890);
    expect(kheironAmountEuros("standard")).toBe(990);
    expect(kheironAmountEuros("extra")).toBe(990);
    expect(kheironAmountEuros("full")).toBe(990);
  });
});
