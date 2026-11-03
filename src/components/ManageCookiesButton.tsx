"use client";

import { reopenCookieConsent } from "@/lib/cookie-consent";

export function ManageCookiesButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={reopenCookieConsent}>
      Gérer les cookies
    </button>
  );
}
