"use client";

import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/utils";

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.65);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-[90] transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
      )}
      aria-hidden={!visible}
    >
      <div className="pointer-events-auto border-t border-border bg-noir-secondary/95 px-4 py-3 shadow-[0_-8px_32px_rgba(0,0,0,0.25)] backdrop-blur-md md:px-6">
        <div className="container-page flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="hidden text-sm text-muted-text sm:block">
            Formations en conditions réelles de plateau · Paris
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <ButtonLink
              href="/formations"
              size="sm"
              className="btn-outline-warm justify-center rounded-lg px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
            >
              Voir les formations
            </ButtonLink>
            <ButtonLink href="/contact" size="sm" className="btn-cta justify-center px-5">
              Réserver ma place
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
