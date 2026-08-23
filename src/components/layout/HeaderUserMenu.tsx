"use client";

import Link from "next/link";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { useAdminUi } from "@/features/admin/AdminUiContext";
import { cn } from "@/lib/utils";

const triggerClass =
  "relative inline-flex h-11 min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-noir-tertiary/80 px-3.5 text-sm font-medium text-cream/90 shadow-sm transition-colors duration-200 hover:border-or/35 hover:bg-noir-tertiary hover:text-or-light select-none [-webkit-tap-highlight-color:transparent]";

const menuItemClass =
  "flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-cream/90 transition-colors hover:bg-noir-tertiary/60 hover:text-or-light";

function displayFirstName(user: {
  firstName?: string | null;
  username?: string | null;
  primaryEmailAddress?: { emailAddress?: string } | null;
}): string {
  if (user.firstName?.trim()) return user.firstName.trim();
  if (user.username?.trim()) return user.username.trim();
  const email = user.primaryEmailAddress?.emailAddress;
  if (email) return email.split("@")[0] ?? "Compte";
  return "Compte";
}

type HeaderUserMenuProps = {
  avatarSrc?: string | null;
};

/** Bouton compte : Login cliquable immédiatement (pas de squelette Clerk). */
export function HeaderUserMenu({ avatarSrc = null }: HeaderUserMenuProps) {
  const { user, isLoaded } = useUser();
  const { isSignedIn, isAdminEligible, isFormateurEligible, isIntervenantEligible } =
    useAdminUi();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Ne pas attendre Clerk isLoaded : sinon pastille morte si Clerk JS tarde / bloque sur iOS.
  if (!isSignedIn) {
    return (
      <Link href="/sign-in" className={triggerClass}>
        Login
      </Link>
    );
  }

  // Attendre le profil Clerk pour le libellé — évite le flash email → prénom.
  const prenom = isLoaded && user ? displayFirstName(user) : null;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className={cn(triggerClass, open && "border-or/35 bg-noir-tertiary text-or-light")}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={prenom ? `Menu compte — ${prenom}` : "Menu compte"}
        onClick={() => setOpen((prev) => !prev)}
      >
        {avatarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarSrc}
            alt=""
            width={28}
            height={28}
            className="size-7 shrink-0 rounded-full object-cover"
          />
        ) : null}
        <span className="max-w-[8rem] truncate">
          {prenom ?? (
            <span
              className="inline-block h-3 w-14 rounded-sm bg-cream/20 align-middle"
              aria-hidden
            />
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 opacity-70 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Menu compte"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[100000] min-w-[16rem] overflow-hidden rounded-xl border border-border bg-noir-secondary p-1.5 shadow-2xl"
        >
          <Link
            href="/mon-profil"
            role="menuitem"
            className={menuItemClass}
            onClick={() => setOpen(false)}
          >
            Mon profil
          </Link>
          {isFormateurEligible || isIntervenantEligible ? (
            <Link
              href="/mes-sessions"
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              Mes sessions
            </Link>
          ) : null}
          {isAdminEligible ? (
            <>
              <Link
                href="/les-sessions"
                role="menuitem"
                className={menuItemClass}
                onClick={() => setOpen(false)}
              >
                Les sessions
              </Link>
              <Link
                href="/les-paiements"
                role="menuitem"
                className={menuItemClass}
                onClick={() => setOpen(false)}
              >
                Les paiements
              </Link>
              <Link
                href="/les-utilisateurs"
                role="menuitem"
                className={menuItemClass}
                onClick={() => setOpen(false)}
              >
                Les utilisateurs
              </Link>
            </>
          ) : (
            <Link
              href="/mes-reservations"
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              Mes réservations
            </Link>
          )}
          <SignOutButton redirectUrl="/">
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              Se déconnecter
            </button>
          </SignOutButton>
        </div>
      ) : null}
    </div>
  );
}
