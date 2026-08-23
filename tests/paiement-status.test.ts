import { describe, expect, it } from "vitest";

import {
  resolvePaiementStatus,
  splitEleveName,
} from "@/lib/paiement-status";

describe("splitEleveName", () => {
  it("sépare prénom et nom", () => {
    expect(splitEleveName("Marie Dupont")).toEqual({
      prenom: "Marie",
      nom: "Dupont",
    });
  });

  it("garde un seul mot comme prénom", () => {
    expect(splitEleveName("Marie")).toEqual({ prenom: "Marie", nom: "" });
  });
});

describe("resolvePaiementStatus", () => {
  it("préfère Stripe payé", () => {
    expect(
      resolvePaiementStatus({
        localStatus: "en_paiement",
        stripe: { status: "complete", paymentStatus: "paid" },
      }),
    ).toBe("paye");
  });

  it("marque un Checkout ouvert comme en cours", () => {
    expect(
      resolvePaiementStatus({
        localStatus: "en_paiement",
        stripe: { status: "open", paymentStatus: "unpaid" },
      }),
    ).toBe("en_cours");
  });

  it("marque une session expirée comme annulée", () => {
    expect(
      resolvePaiementStatus({
        localStatus: "en_paiement",
        stripe: { status: "expired", paymentStatus: "unpaid" },
      }),
    ).toBe("annule");
  });

  it("marque un paiement asynchrone échoué comme refusé", () => {
    expect(
      resolvePaiementStatus({
        localStatus: "en_paiement",
        stripe: { status: "complete", paymentStatus: "unpaid" },
      }),
    ).toBe("refuse");
  });

  it("marque un remboursement Stripe", () => {
    expect(
      resolvePaiementStatus({
        localStatus: "payee",
        stripe: {
          status: "complete",
          paymentStatus: "paid",
          amountRefunded: 190000,
        },
      }),
    ).toBe("rembourse");
  });

  it("retombe sur le statut local si Stripe est absent", () => {
    expect(resolvePaiementStatus({ localStatus: "payee" })).toBe("paye");
    expect(resolvePaiementStatus({ localStatus: "annule" })).toBe("annule");
  });
});
