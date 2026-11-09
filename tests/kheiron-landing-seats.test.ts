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
    expect(html).not.toMatch(/pas une de plus/i);
  });

  it("annonce le tarif à partir de la 6e place pendant le lancement", () => {
    const html = landing("early");
    expect(html).toContain("Dès la 6");
    expect(html).toContain("e</sup> place, le tarif passe à");
    expect(html).toContain("330");
    expect(html).toContain("990");
    expect(landing("standard")).not.toContain("Dès la 6");
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
