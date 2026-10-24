"use client";

import { useSyncExternalStore } from "react";

const CONSENT_KEY = "cinemergence-cookie-consent";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function hidden() {
  return localStorage.getItem(CONSENT_KEY) !== null;
}

export function KheironConsent() {
  const dismissed = useSyncExternalStore(subscribe, hidden, () => true);
  if (dismissed) return null;

  const choose = (value: "accepted" | "rejected") => {
    localStorage.setItem(CONSENT_KEY, value);
    if (value === "accepted") window.dispatchEvent(new Event("cookie-consent-accepted"));
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="k-consent" role="dialog" aria-label="Consentement cookies">
      <p>
        Ce site mesure l&apos;audience avec Google Analytics uniquement si tu acceptes.{" "}
        <a href="/confidentialite">Politique de confidentialité</a>
      </p>
      <div className="row">
        <button type="button" className="no" onClick={() => choose("rejected")}>
          Je refuse
        </button>
        <button type="button" className="yes" onClick={() => choose("accepted")}>
          J&apos;accepte
        </button>
      </div>
    </div>
  );
}
