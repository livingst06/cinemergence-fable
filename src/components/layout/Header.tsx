"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Logo } from "@/components/layout/Logo";
import { SHOW_THEME_TOGGLE, ThemeToggle } from "@/components/theme/ThemeToggle";
import type { FormationData } from "@/lib/defaults";
import { formationPath } from "@/lib/defaults";
import { cn } from "@/lib/utils";

type HeaderProps = {
  formations: Pick<FormationData, "slug" | "titreCourt" | "prioritaire">[];
};

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/intervenants", label: "Intervenants" },
  { href: "/financement", label: "Financement" },
  { href: "/galerie", label: "Galerie" },
  { href: "/association", label: "Qui sommes-nous ?" },
];

function navLinkClass(active: boolean) {
  return cn(
    "text-sm font-medium transition-colors hover:text-or-light",
    active ? "text-projector-light" : "text-cream/75",
  );
}

export function Header({ formations }: HeaderProps) {
  const pathname = usePathname();
  const [formationsOpen, setFormationsOpen] = useState(false);
  const navToggleRef = useRef<HTMLInputElement>(null);
  const formationsCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openFormationsMenu = () => {
    if (formationsCloseTimerRef.current) {
      clearTimeout(formationsCloseTimerRef.current);
      formationsCloseTimerRef.current = null;
    }
    setFormationsOpen(true);
  };

  const scheduleCloseFormationsMenu = () => {
    if (formationsCloseTimerRef.current) clearTimeout(formationsCloseTimerRef.current);
    formationsCloseTimerRef.current = setTimeout(() => {
      setFormationsOpen(false);
      formationsCloseTimerRef.current = null;
    }, 180);
  };

  const closeMobileNav = () => {
    if (navToggleRef.current) navToggleRef.current.checked = false;
  };

  useEffect(() => {
    return () => {
      if (formationsCloseTimerRef.current) clearTimeout(formationsCloseTimerRef.current);
    };
  }, []);

  const featured = formations.filter((f) => f.prioritaire);
  const menuFormations = featured.length > 0 ? featured : formations.slice(0, 4);
  const formationsActive = pathname === "/formations" || pathname.startsWith("/formations/");

  return (
    <>
      <header className="site-header fixed inset-x-0 top-[calc(var(--site-notice-h)+env(safe-area-inset-top,0px))] z-[99999] border-b border-border bg-noir-secondary/95 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-3 md:h-[4.5rem]">
          <Logo className="min-w-0 max-w-[55%] shrink" />

          <nav className="hidden items-center gap-5 xl:flex xl:gap-6" aria-label="Navigation principale">
            <Link href="/" className={navLinkClass(pathname === "/")} aria-current={pathname === "/" ? "page" : undefined}>
              Accueil
            </Link>

            <div
              className="relative"
              onMouseEnter={openFormationsMenu}
              onMouseLeave={scheduleCloseFormationsMenu}
              onFocus={openFormationsMenu}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  scheduleCloseFormationsMenu();
                }
              }}
            >
              <Link
                href="/formations"
                className={navLinkClass(formationsActive)}
                aria-expanded={formationsOpen}
                aria-haspopup="true"
                aria-current={formationsActive ? "page" : undefined}
              >
                Formations
              </Link>
              {formationsOpen && (
                <div className="absolute left-0 top-full z-50 pt-3">
                  <div className="w-80 overflow-hidden rounded-2xl border border-border bg-noir-secondary p-2 shadow-2xl plateau-glow">
                    <Link
                      href="/formations"
                      className="mb-1 block rounded-xl px-3 py-2.5 text-sm font-semibold text-or-light transition-colors hover:bg-noir-tertiary/50"
                    >
                      Toutes les formations
                    </Link>
                    {menuFormations.map((f) => (
                      <Link
                        key={f.slug}
                        href={formationPath(f.slug)}
                        className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-cream/90 transition-colors hover:bg-noir-tertiary/50 hover:text-or-light"
                      >
                        <span>{f.titreCourt}</span>
                        {f.prioritaire && (
                          <span className="rounded-full bg-projector/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-projector-light">
                            À la une
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {navLinks
              .filter((link) => link.href !== "/")
              .map((link) => {
                const active =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={navLinkClass(active)}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}

            {SHOW_THEME_TOGGLE && <ThemeToggle className="h-9 w-9" />}
            <ButtonLink href="/contact" size="sm" className="btn-cta px-5">
              Je m&apos;inscris
            </ButtonLink>
          </nav>

          <div className="relative z-[1] flex shrink-0 items-center gap-3 xl:hidden">
            {SHOW_THEME_TOGGLE && <ThemeToggle />}
            <label className="mobile-nav-trigger relative inline-flex h-11 min-h-[44px] w-11 min-w-[44px] cursor-pointer items-center justify-center rounded-lg border border-border bg-noir-secondary transition-[background-color,border-color,color,box-shadow] duration-200">
              <input
                ref={navToggleRef}
                type="checkbox"
                id="mobile-nav-toggle"
                className="native-touch-control xl:hidden"
              />
              <span className="pointer-events-none relative z-0 flex items-center justify-center" aria-hidden>
                <Menu className="mobile-nav-icon-open h-6 w-6" />
                <X className="mobile-nav-icon-close h-6 w-6" />
              </span>
              <span className="sr-only">Menu</span>
            </label>
          </div>
        </div>
      </header>

      <div className="mobile-nav-panel fixed inset-0 z-[99998] xl:hidden">
        <label
          htmlFor="mobile-nav-toggle"
          className="mobile-nav-backdrop absolute inset-0 cursor-pointer bg-noir/75"
          aria-label="Fermer le menu"
        />
        <nav
          className="mobile-nav-drawer absolute left-0 right-0 top-[calc(var(--site-notice-h)+4rem+env(safe-area-inset-top,0px))] max-h-[calc(100dvh-var(--site-notice-h)-4rem-env(safe-area-inset-top))] overflow-y-auto border-b border-border bg-noir-secondary shadow-2xl md:top-[calc(var(--site-notice-h)+4.5rem+env(safe-area-inset-top,0px))] md:max-h-[calc(100dvh-var(--site-notice-h)-4.5rem-env(safe-area-inset-top))]"
          aria-label="Navigation mobile"
        >
          <div className="container-page flex flex-col gap-1 py-4 pb-8">
            <Link
              href="/"
              className={cn(
                "block rounded-xl px-3 py-3 text-sm font-semibold active:bg-noir-tertiary/50",
                pathname === "/" ? "text-projector-light" : "text-cream/90",
              )}
              onClick={closeMobileNav}
            >
              Accueil
            </Link>
            <p className="eyebrow px-2 py-2">Formations</p>
            <Link
              href="/formations"
              className="block rounded-xl px-3 py-3 text-sm font-semibold text-or-light active:bg-noir-tertiary/50"
              onClick={closeMobileNav}
            >
              Toutes les formations
            </Link>
            {menuFormations.map((f) => (
              <Link
                key={f.slug}
                href={formationPath(f.slug)}
                className="block rounded-xl px-3 py-3 text-sm text-cream/90 active:bg-noir-tertiary/50"
                onClick={closeMobileNav}
              >
                {f.titreCourt}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            {navLinks
              .filter((link) => link.href !== "/")
              .map((link) => {
                const active =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block rounded-xl px-3 py-3 text-sm active:bg-noir-tertiary/50",
                      active ? "text-projector-light" : "text-cream/90",
                    )}
                    onClick={closeMobileNav}
                  >
                    {link.label}
                  </Link>
                );
              })}
            <ButtonLink href="/contact" className="btn-cta mt-3" onClick={closeMobileNav}>
              Je m&apos;inscris
            </ButtonLink>
          </div>
        </nav>
      </div>
    </>
  );
}
