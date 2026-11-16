import Link from "next/link";

import { cn } from "@/lib/utils";

const links = [
  { href: "/les-sessions", id: "sessions" as const, label: "Les sessions" },
  { href: "/les-paiements", id: "paiements" as const, label: "Les paiements" },
];

type AdminOutilsNavProps = {
  current: "sessions" | "paiements";
  className?: string;
};

export function AdminOutilsNav({ current, className }: AdminOutilsNavProps) {
  return (
    <nav
      aria-label="Outils admin"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {links.map((link) => {
        const active = link.id === current;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "border-or/40 bg-or/15 text-or-light"
                : "border-border bg-noir-tertiary/40 text-cream/75 hover:border-or/30 hover:text-or-light",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
