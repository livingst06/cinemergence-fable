import Link from "next/link";

import { cn } from "@/lib/utils";

type FormationCardSessionsBannerProps = {
  href: string;
  className?: string;
};

/** Bandeau vert en bas de card — CTA vers la liste des sessions. */
export function FormationCardSessionsBanner({
  href,
  className,
}: FormationCardSessionsBannerProps) {
  return (
    <Link
      href={href}
      className={cn(
        "mt-auto block w-full shrink-0 bg-convert px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors",
        "hover:bg-convert-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-convert-light focus-visible:ring-offset-2 focus-visible:ring-offset-noir-secondary",
        className,
      )}
    >
      Voir le détail de la formation
    </Link>
  );
}
