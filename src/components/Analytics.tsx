"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";

const CONSENT_KEY = "cinemergence-cookie-consent";

function subscribeConsent(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("cookie-consent-accepted", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cookie-consent-accepted", callback);
  };
}

function getConsentSnapshot() {
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const consented = useSyncExternalStore(subscribeConsent, getConsentSnapshot, () => false);

  if (!gaId || !consented) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />
      <Script id="ga-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { send_page_view: true });
        `}
      </Script>
    </>
  );
}
