import { describe, expect, it } from "vitest";

import { isPaidKheironSession } from "@/lib/kheiron-checkout";

const earlyPaid = {
  livemode: true,
  mode: "payment",
  status: "complete",
  payment_status: "paid",
  currency: "eur",
  amount_total: 129_000,
  payment_link: "plink_1UTe7yCXL04XIOiV6iAxpnwA",
};

describe("isPaidKheironSession", () => {
  it("accepte le lien à 1 290 € une fois payé", () => {
    expect(isPaidKheironSession(earlyPaid)).toBe(true);
  });

  it("accepte le lien à 1 490 € une fois payé", () => {
    expect(
      isPaidKheironSession({
        ...earlyPaid,
        amount_total: 149_000,
        payment_link: "plink_1UU3ceCXL04XIOiVTvg1tidi",
      }),
    ).toBe(true);
  });

  it("refuse un autre lien, un montant échangé, un impayé ou le mode test", () => {
    expect(isPaidKheironSession({ ...earlyPaid, payment_link: "plink_autre" })).toBe(false);
    expect(isPaidKheironSession({ ...earlyPaid, amount_total: 149_000 })).toBe(false);
    expect(isPaidKheironSession({ ...earlyPaid, payment_status: "unpaid" })).toBe(false);
    expect(isPaidKheironSession({ ...earlyPaid, status: "open" })).toBe(false);
    expect(isPaidKheironSession({ ...earlyPaid, livemode: false })).toBe(false);
    expect(isPaidKheironSession({ ...earlyPaid, payment_link: { id: "plink_autre" } })).toBe(false);
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
