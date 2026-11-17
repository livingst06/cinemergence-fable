import { describe, expect, it } from "vitest";
import {
  billingName,
  isSuccessfulLivePayment,
  paiementMatchesUser,
  paiementsSansInscription,
  paymentIntentId,
  paymentMethodType,
  reglementOf,
  type CheckoutForPaiement,
  type SessionPaiement,
} from "@/lib/paiements";

function session(overrides: CheckoutForPaiement = {}): CheckoutForPaiement {
  return {
    id: "cs_live_example12345678",
    livemode: true,
    status: "complete",
    payment_status: "paid",
    amount_total: 89000,
    currency: "eur",
    ...overrides,
  };
}

describe("paiements", () => {
  it("distingue la carte et Klarna", () => {
    expect(reglementOf("card")).toBe("une_fois");
    expect(reglementOf("klarna")).toBe("plusieurs_fois");
    expect(reglementOf(null)).toBeNull();
  });

  it("lit le moyen de paiement sur le PaymentIntent", () => {
    const paid = session({
      payment_intent: { id: "pi_123", payment_method: { type: "klarna" } },
    });
    expect(paymentMethodType(paid)).toBe("klarna");
    expect(paymentIntentId(paid)).toBe("pi_123");
    expect(paymentIntentId(session({ payment_intent: "pi_plain" }))).toBe("pi_plain");
    expect(
      billingName(
        session({
          payment_intent: { payment_method: { billing_details: { name: "Alex Guillot" } } },
        }),
      ),
    ).toBe("Alex Guillot");
  });

  it("n'enregistre qu'un paiement live déjà réussi", () => {
    expect(isSuccessfulLivePayment(session())).toBe(true);
    expect(isSuccessfulLivePayment(session({ livemode: false }))).toBe(false);
    expect(isSuccessfulLivePayment(session({ payment_status: "unpaid" }))).toBe(false);
    expect(isSuccessfulLivePayment(session({ status: "open" }))).toBe(false);
    expect(isSuccessfulLivePayment(session({ amount_total: 0 }))).toBe(false);
  });

  it("ne compte pas deux fois un paiement déjà lié à une inscription", () => {
    const rows: SessionPaiement[] = [
      paiement({
        checkoutSessionId: "cs_live_aaaaaaaa",
        payerEmail: "a@example.com",
        payerName: "A",
      }),
      paiement({
        checkoutSessionId: "cs_live_bbbbbbbb",
        inscriptionId: 4,
        payerEmail: "b@example.com",
        payerName: "B",
      }),
      paiement({
        checkoutSessionId: "cs_live_cccccccc",
        payerEmail: "c@example.com",
        amountEuros: 990,
      }),
    ];
    const extras = paiementsSansInscription(rows, [
      { id: 4, email: "autre@example.com" },
      { id: 9, email: "A@example.com" },
    ]);
    expect(extras.map((row) => row.checkoutSessionId)).toEqual(["cs_live_cccccccc"]);
  });

  it("reconnaît l'élève par son compte ou par son e-mail", () => {
    const row = paiement({ userId: 7, payerEmail: "a@example.com" });
    expect(paiementMatchesUser(row, { userId: 7, email: "autre@example.com" })).toBe(true);
    expect(paiementMatchesUser(row, { userId: 3, email: "A@example.com" })).toBe(true);
    expect(paiementMatchesUser(row, { userId: 3, email: "b@example.com" })).toBe(false);
  });
});

function paiement(overrides: Partial<SessionPaiement> = {}): SessionPaiement {
  return {
    checkoutSessionId: "cs_live_aaaaaaaa",
    inscriptionId: null,
    userId: null,
    payerEmail: null,
    payerName: null,
    eleveName: null,
    eleveAvatarKey: null,
    amountEuros: 890,
    paidAt: "2026-11-06T10:00:00.000Z",
    formationSlug: "kheiron",
    formationTitre: "Masterclass avec Kheiron",
    sessionId: 28,
    sessionLabel: null,
    sessionDateDebut: "2026-11-28T00:00:00.000Z",
    sessionDateFin: "2026-12-06T00:00:00.000Z",
    ...overrides,
  };
}
