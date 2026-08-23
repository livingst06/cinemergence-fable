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
        "mt-auto block w-full shrink-0 bg-convert px-4 py-3 text-center text-sm font-semibold tracking-wide text-white transition-colors md:text-base",
        "hover:bg-convert-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-convert-light focus-visible:ring-offset-2 focus-visible:ring-offset-noir-secondary",
        className,
      )}
    >
      Voir les prochaines sessions
    </Link>
  );
}
