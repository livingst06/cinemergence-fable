"use client";

import Link from "next/link";
import { SignOutButton, useAuth, useUser } from "@clerk/nextjs";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { useAdminUi } from "@/features/admin/AdminUiContext";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/utils";

const triggerClass =
  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-noir-tertiary/80 px-3.5 text-xs font-medium text-cream/90 shadow-sm backdrop-blur-md transition-colors duration-200 hover:border-or/35 hover:bg-noir-tertiary hover:text-or-light";

const menuItemClass =
  "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-cream/90 transition-colors hover:bg-noir-tertiary/60 hover:text-or-light";

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

/** Bouton compte : prénom + menu (pattern GitHub / Linear / Notion). */
export function HeaderUserMenu() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const { isAdminEligible } = useAdminUi();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!isLoaded) {
    return <div className="h-8 w-20 shrink-0 rounded-full border border-border/40 bg-noir-tertiary/40" aria-hidden />;
  }

  if (!isSignedIn || !user) {
    return (
      <ButtonLink href="/sign-in" variant="ghost" className={triggerClass}>
        Login
      </ButtonLink>
    );
  }

  const prenom = displayFirstName(user);
  const primaryHref = isAdminEligible ? "/les-demandes" : "/mes-reservations";
  const primaryLabel = isAdminEligible ? "Les demandes" : "Mes demandes";

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className={cn(triggerClass, open && "border-or/35 bg-noir-tertiary text-or-light")}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="max-w-[8rem] truncate">{prenom}</span>
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
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[100000] min-w-[11.5rem] overflow-hidden rounded-xl border border-border bg-noir-secondary p-1.5 shadow-2xl"
        >
          <Link
            href={primaryHref}
            role="menuitem"
            className={menuItemClass}
            onClick={() => setOpen(false)}
          >
            {primaryLabel}
          </Link>
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
