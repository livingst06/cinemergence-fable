"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { FormationData } from "@/lib/defaults";

type HeaderProps = {
  formations: Pick<FormationData, "slug" | "titreCourt" | "prioritaire">[];
};

const navLinks = [
  { href: "/intervenants", label: "Intervenants" },
  { href: "/financement", label: "Financement" },
  { href: "/association", label: "L'association" },
];

export function Header({ formations }: HeaderProps) {
  const [formationsOpen, setFormationsOpen] = useState(false);
  const navToggleRef = useRef<HTMLInputElement>(null);

  const closeMobileNav = () => {
    if (navToggleRef.current) navToggleRef.current.checked = false;
  };

  return (
    <>
      <header className="site-header fixed inset-x-0 top-0 z-[99999] border-b border-border bg-noir pt-[env(safe-area-inset-top,0px)]">
        <div className="container-page flex h-16 items-center justify-between gap-3 md:h-[4.5rem]">
          <Logo className="min-w-0 max-w-[55%] shrink" />

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigation principale">
            <div
              className="relative"
              onMouseEnter={() => setFormationsOpen(true)}
              onMouseLeave={() => setFormationsOpen(false)}
            >
              <button
                type="button"
                className="text-sm font-medium text-cream/75 transition-colors hover:text-or-light"
                aria-expanded={formationsOpen}
              >
                Formations
              </button>
              {formationsOpen && (
                <div className="absolute left-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-border bg-noir-secondary p-2 shadow-2xl plateau-glow">
                  {formations.map((f) => (
                    <Link
                      key={f.slug}
                      href={`/${f.slug}`}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-cream/90 transition-colors hover:bg-noir-tertiary/50 hover:text-or-light"
                    >
                      <span>{f.titreCourt}</span>
                      {f.prioritaire && (
                        <span className="rounded-full bg-projector/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-projector-light">
                          Live
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-cream/75 transition-colors hover:text-or-light"
              >
                {link.label}
              </Link>
            ))}

            <ThemeToggle className="h-9 w-9" />
            <ButtonLink href="/contact" size="sm" className="btn-cta px-5">
              Je me lance
            </ButtonLink>
          </nav>

          <div className="relative z-[1] flex shrink-0 items-center gap-3 lg:hidden">
            <ThemeToggle />
            <label className="mobile-nav-trigger relative inline-flex h-11 min-h-[44px] w-11 min-w-[44px] cursor-pointer items-center justify-center rounded-lg border border-border bg-noir-secondary text-or-light">
              <input
                ref={navToggleRef}
                type="checkbox"
                id="mobile-nav-toggle"
                className="native-touch-control lg:hidden"
              />
              <span className="pointer-events-none relative z-0 flex items-center justify-center" aria-hidden>
                <Menu className="mobile-nav-icon-open h-6 w-6" />
                <X className="mobile-nav-icon-close hidden h-6 w-6" />
              </span>
              <span className="sr-only">Menu</span>
            </label>
          </div>
        </div>
      </header>

      <div className="mobile-nav-panel fixed inset-0 z-[99998] lg:hidden">
        <label
          htmlFor="mobile-nav-toggle"
          className="mobile-nav-backdrop absolute inset-0 cursor-pointer bg-noir/75"
          aria-label="Fermer le menu"
        />
        <nav
          className="mobile-nav-drawer absolute left-0 right-0 top-16 max-h-[calc(100dvh-4rem-env(safe-area-inset-top))] overflow-y-auto border-b border-border bg-noir-secondary shadow-2xl md:top-[4.5rem]"
          aria-label="Navigation mobile"
        >
          <div className="container-page flex flex-col gap-1 py-4 pb-8">
            <p className="eyebrow px-2 py-2">Formations</p>
            {formations.map((f) => (
              <Link
                key={f.slug}
                href={`/${f.slug}`}
                className="block rounded-xl px-3 py-3 text-sm text-cream/90 active:bg-noir-tertiary/50"
                onClick={closeMobileNav}
              >
                {f.titreCourt}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl px-3 py-3 text-sm text-cream/90 active:bg-noir-tertiary/50"
                onClick={closeMobileNav}
              >
                {link.label}
              </Link>
            ))}
            <ButtonLink href="/contact" className="btn-cta mt-3" onClick={closeMobileNav}>
              Je me lance
            </ButtonLink>
          </div>
        </nav>
      </div>
    </>
  );
}
