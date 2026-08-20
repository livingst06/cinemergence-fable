"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const CONSENT_KEY = "cinemergence-cookie-consent";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return !localStorage.getItem(CONSENT_KEY);
}

function getServerSnapshot() {
  return false;
}

export function CookieBanner() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    window.dispatchEvent(new Event("cookie-consent-accepted"));
    window.dispatchEvent(new Event("storage"));
  };

  const reject = () => {
    localStorage.setItem(CONSENT_KEY, "rejected");
    window.dispatchEvent(new Event("storage"));
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-or/20 bg-noir-secondary p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] shadow-2xl overscroll-contain md:p-6 md:pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
      role="dialog"
      aria-label="Consentement cookies"
    >
      <div className="container-page flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-3xl text-xs leading-relaxed text-muted-text md:text-sm">
          Ce site utilise des cookies pour mesurer l&apos;audience (Google Analytics) et
          améliorer votre expérience. En continuant, vous acceptez notre{" "}
          <Link href="/confidentialite" className="text-or hover:underline">
            politique de confidentialité
          </Link>
          .
        </p>
        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            variant="outline"
            onClick={reject}
            className="min-h-11 border-or/30 text-cream hover:bg-or/10"
          >
            Je refuse
          </Button>
          <Button onClick={accept} className="btn-cta min-h-11">
            J&apos;accepte
          </Button>
        </div>
      </div>
    </div>
  );
}
