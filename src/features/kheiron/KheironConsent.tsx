"use client";

import { useSyncExternalStore } from "react";

import { CONSENT_KEY, publishConsent } from "@/lib/cookie-consent";

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

  const choose = (value: "accepted" | "rejected") => publishConsent(value);

  return (
    <div className="k-consent" role="dialog" aria-label="Consentement cookies">
      <p>
        On utilise des cookies pour mesurer l&apos;audience du site (Google Analytics) et
        l&apos;efficacité de nos publicités (Meta). Ils ne sont déposés que si tu acceptes, et tu
        peux changer d&apos;avis à tout moment depuis « Gérer les cookies », en bas de chaque page.{" "}
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
