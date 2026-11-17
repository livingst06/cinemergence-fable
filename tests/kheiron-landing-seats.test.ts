import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { KheironLanding } from "@/features/kheiron/KheironLanding";
import { kheironOfferFromStripeCount, type KheironOfferPhase } from "@/lib/kheiron-offer";

const phases: KheironOfferPhase[] = ["early", "standard", "extra", "full"];

function landing(phase: KheironOfferPhase, paidCount = phase === "early" ? 4 : 5) {
  return renderToStaticMarkup(
    createElement(KheironLanding, {
      offer: { phase, paymentLink: "https://buy.stripe.com/test", paidCount },
    }),
  );
}

describe("landing Kheiron, places restantes", () => {
  it.each(phases)("n'affiche aucun nombre de places restantes en phase %s", (phase) => {
    const html = landing(phase);
    expect(html).not.toMatch(/il reste \d/i);
    expect(html).not.toMatch(/places? restantes/i);
    expect(html).not.toMatch(/\d+\s+places/i);
    expect(html).not.toMatch(/places supplémentaires/i);
    expect(html).not.toMatch(/pas une de plus/i);
  });

  it.each(phases)("affiche 990 € TTC en phase %s", (phase) => {
    const html = landing(phase);
    expect(html).toContain("990");
    expect(html).not.toContain("890");
  });

  it("annonce le passage à 990 € tant que Stripe + hors process est sous 5", () => {
    const under = kheironOfferFromStripeCount(3);
    expect(under.paidCount).toBe(4);
    const html = landing(under.phase, under.paidCount);
    expect(html).toContain("Dès la 6");
    expect(html).toContain("e</sup> place, le tarif passe à");
  });

  it("retire l'annonce dès 5 places payées, Stripe + hors process", () => {
    const reached = kheironOfferFromStripeCount(4);
    expect(reached.paidCount).toBe(5);
    const html = landing(reached.phase, reached.paidCount);
    expect(html).not.toContain("Dès la 6");
    expect(html).not.toContain("le tarif passe à");
  });

  it.each([5, 6, 20, 24] as const)(
    "retire l'annonce de la 6e place à %s places payées",
    (paidCount) => {
      const html = landing("standard", paidCount);
      expect(html).not.toContain("Dès la 6");
      expect(html).not.toContain("le tarif passe à");
    },
  );

  it("ne distingue pas les places supplémentaires du tarif standard", () => {
    expect(landing("extra")).not.toContain("supplémentaire");
    expect(landing("standard")).not.toContain("supplémentaire");
  });

  it("dit que la session est complète sans compter les places", () => {
    const html = landing("full");
    expect(html).toContain("Cette session est complète.");
    expect(html).not.toMatch(/il ne reste/i);
  });
});
