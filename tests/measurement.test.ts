import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { KHEIRON_ITEM_ID, KHEIRON_ITEM_NAME } from "@/lib/kheiron-offer";
import {
  buildPurchasePayload,
  gaClientId,
  gaSessionId,
  internationalPhone,
  normalizeEmail,
  trackingForConsent,
} from "@/lib/measurement-format";
import { checkoutFormBody, checkoutMetadata } from "@/lib/stripe-checkout";
import { verifyStripeSignature } from "@/lib/stripe-signature";

describe("internationalPhone", () => {
  it("passe un mobile français en +33 et laisse le reste tel quel", () => {
    expect(internationalPhone("06 12 34 56 78")).toBe("+33612345678");
    expect(internationalPhone("07.12.34.56.78")).toBe("+33712345678");
    expect(internationalPhone("+33612345678")).toBe("+33612345678");
    expect(internationalPhone("01 23 45 67 89")).toBe("01 23 45 67 89");
    expect(internationalPhone("  ")).toBeUndefined();
  });
});

describe("normalizeEmail", () => {
  it("met en minuscules et refuse un email invalide", () => {
    expect(normalizeEmail("  Lea@Example.com ")).toBe("lea@example.com");
    expect(normalizeEmail("pas un email")).toBeUndefined();
  });
});

describe("cookies Google", () => {
  it("garde les deux derniers blocs du client id", () => {
    expect(gaClientId("GA1.1.1234567890.1791900000")).toBe("1234567890.1791900000");
  });

  it("lit les deux formats de session", () => {
    expect(gaSessionId("GS1.1.1792058000.3.1.1")).toBe("1792058000");
    expect(gaSessionId("GS2.1.s1792058000$o3$g1$t1")).toBe("1792058000");
  });
});

describe("trackingForConsent", () => {
  it("retire les identifiants tant que le visiteur n'a pas accepté", () => {
    const input = {
      consent: "rejected",
      fbp: "fb.1.1.1",
      fbc: "fb.1.1.TEST",
      gaClientId: "1.2",
      gaSessionId: "3",
      utm: { utm_source: "facebook" },
    };
    expect(trackingForConsent(input)).toEqual({
      consent: "rejected",
      utm: { utm_source: "facebook" },
    });
    expect(trackingForConsent({ ...input, consent: "accepted" }).fbc).toBe("fb.1.1.TEST");
  });
});

describe("checkoutMetadata", () => {
  it("omet les identifiants et les clés vides, et coupe à 500 caractères", () => {
    const metadata = checkoutMetadata(
      {
        offer: KHEIRON_ITEM_ID,
        consent: null,
        fbp: "fb.1.secret",
        utm: { utm_source: "facebook", utm_campaign: "" },
      },
      "203.0.113.10, 10.0.0.1",
      "Mozilla",
    );
    expect(metadata.consent).toBe("none");
    expect(metadata.fbp).toBeUndefined();
    expect(metadata.ip).toBe("203.0.113.10, 10.0.0.1");
    expect(metadata.utm_source).toBe("facebook");
    expect(metadata.utm_campaign).toBeUndefined();
    expect(metadata.origin).toBe("checkout_site");
  });
});

describe("checkoutFormBody", () => {
  it("laisse le jeton de session Stripe non encodé et prend le prix de la phase", () => {
    const early = checkoutFormBody({ offer: KHEIRON_ITEM_ID, consent: "accepted" }, "early", undefined, undefined);
    const standard = checkoutFormBody({ offer: KHEIRON_ITEM_ID }, "standard", undefined, undefined);
    expect(early).toContain("session_id%3D{CHECKOUT_SESSION_ID}");
    expect(early).not.toContain("%7BCHECKOUT_SESSION_ID%7D");
    expect(early).toContain("unit_amount%5D=89000");
    expect(standard).toContain("unit_amount%5D=99000");
    expect(early).toContain("phone_number_collection%5Benabled%5D=true");
    expect(early).not.toContain("payment_method_types");
  });
});

describe("buildPurchasePayload", () => {
  it("omet les champs vides, découpe le nom et marque un paiement test", () => {
    const payload = buildPurchasePayload(
      {
        id: "cs_test_abc12345",
        created: 1793300000,
        livemode: false,
        amount_total: 129000,
        currency: "eur",
        client_reference_id: "recABCDEFGHIJKLMN",
        metadata: {
          landing: "/formations/kheiron",
          consent: "accepted",
          ga_client_id: "1234567890.1791900000",
          utm_source: "facebook",
          utm_campaign: "",
          ip: "203.0.113.10",
        },
        customer_details: {
          email: " Lea@Example.com ",
          name: "Léa Martin",
          phone: "+33612345678",
          address: { city: "Paris", postal_code: "75011", country: "FR" },
        },
        discounts: [{ promotion_code: { code: "CODE" } }],
      },
      "https://cinemergence.fr",
      1793300000,
    );

    expect(payload).toMatchObject({
      event_name: "purchase",
      event_id: "cs_test_abc12345",
      event_time: 1793300000,
      page_location: "https://cinemergence.fr/formations/kheiron",
      test: true,
      source: "checkout_site",
      consent: "accepted",
      client_id: "1234567890.1791900000",
      ip_override: "203.0.113.10",
      client_reference_id: "recABCDEFGHIJKLMN",
      utm: { utm_source: "facebook" },
      user_data: {
        email_address: "lea@example.com",
        phone_number: "+33612345678",
        address: { first_name: "léa", last_name: "martin", city: "paris", postal_code: "75011", country: "FR" },
      },
      ecommerce: {
        transaction_id: "cs_test_abc12345",
        value: 1290,
        currency: "EUR",
        coupon: "CODE",
        items: [
          {
            item_id: KHEIRON_ITEM_ID,
            item_name: KHEIRON_ITEM_NAME,
            item_category: "formation",
            price: 1290,
            quantity: 1,
          },
        ],
      },
    });
    expect(payload).not.toHaveProperty("ga_session_id");
    expect(payload).not.toHaveProperty("fbp");
    expect((payload.utm as Record<string, string>).utm_campaign).toBeUndefined();
  });

  it("reconnaît un lien de paiement et retombe sur la page d'accueil", () => {
    const payload = buildPurchasePayload(
      {
        id: "cs_live_abc12345",
        livemode: true,
        amount_total: 99000,
        payment_link: "plink_1UU3ceCXL04XIOiVTvg1tidi",
      },
      "https://cinemergence.fr/",
    );
    expect(payload.source).toBe("payment_link");
    expect(payload.test).toBe(false);
    expect(payload.page_location).toBe("https://cinemergence.fr/");
  });
});

describe("verifyStripeSignature", () => {
  it("accepte une signature fraîche et refuse un corps modifié", () => {
    const secret = "whsec_test";
    const payload = '{"id":"evt_1"}';
    const timestamp = "1793300000";
    const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
    const header = `t=${timestamp},v1=${signature}`;
    expect(verifyStripeSignature(payload, header, secret, 1793300000 * 1000)).toBe(true);
    expect(verifyStripeSignature(`${payload} `, header, secret, 1793300000 * 1000)).toBe(false);
    expect(verifyStripeSignature(payload, header, secret, (1793300000 + 301) * 1000)).toBe(false);
  });
});
