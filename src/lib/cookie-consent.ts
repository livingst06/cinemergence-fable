export const CONSENT_KEY = "cinemergence-cookie-consent";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

type ConsentChoice = "accepted" | "rejected";

function dataLayer() {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

/** Écrit le choix, met à jour le consentement Google, puis rouvre les écouteurs du bandeau. */
export function publishConsent(choix: ConsentChoice) {
  localStorage.setItem(CONSENT_KEY, choix);
  const etat = choix === "accepted" ? "granted" : "denied";
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      ad_storage: etat,
      ad_user_data: etat,
      ad_personalization: etat,
      analytics_storage: etat,
    });
  }
  dataLayer().push({ event: "consent_update", consent_choice: choix });
  if (choix === "accepted") window.dispatchEvent(new Event("cookie-consent-accepted"));
  window.dispatchEvent(new Event("storage"));
}

/** Rouvre le bandeau sans effacer le consentement déjà accordé à Tag Manager tant qu'un nouveau choix n'est pas fait. */
export function reopenCookieConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* navigation privée */
  }
  window.dispatchEvent(new Event("storage"));
}
