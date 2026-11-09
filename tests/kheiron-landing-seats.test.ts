import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { KheironLanding } from "@/features/kheiron/KheironLanding";
import type { KheironOfferPhase } from "@/lib/kheiron-offer";

const phases: KheironOfferPhase[] = ["early", "standard", "extra", "full"];

function landing(phase: KheironOfferPhase) {
  return renderToStaticMarkup(
    createElement(KheironLanding, {
      offer: { phase, paymentLink: "https://buy.stripe.com/test" },
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
    expect(html).not.toMatch(/6e place|6<sup/i);
    expect(html).not.toMatch(/pas une de plus/i);
  });

  it("garde le tarif de lancement sans dire après quelle place il s'arrête", () => {
    const html = landing("early");
    expect(html).toContain("Ce tarif de lancement est limité.");
    expect(html).toContain("330");
    expect(html).toContain("990");
    expect(html).not.toContain("6e");
  });

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
