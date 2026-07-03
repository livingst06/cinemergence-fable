"use client";

import { useEffect } from "react";
import Script from "next/script";

const CONSENT_KEY = "cinemergence-cookie-consent";

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    const loadIfConsented = () => {
      if (localStorage.getItem(CONSENT_KEY) === "accepted" && gaId) {
        // GA loaded via Script below when consent given
      }
    };
    loadIfConsented();
    window.addEventListener("cookie-consent-accepted", loadIfConsented);
    return () => window.removeEventListener("cookie-consent-accepted", loadIfConsented);
  }, [gaId]);

  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          if (localStorage.getItem('${CONSENT_KEY}') === 'accepted') {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          }
        `}
      </Script>
    </>
  );
}
