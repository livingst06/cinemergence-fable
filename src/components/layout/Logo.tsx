import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex min-w-0 items-center transition-opacity hover:opacity-90",
        className,
      )}
      aria-label="Cinémergence — Accueil"
    >
      {/* Mode jour : logo noir */}
      <Image
        src="/images/brand/logo-cinemergence-light.png"
        alt="Cinémergence"
        width={1668}
        height={586}
        priority
        className="h-8 w-auto dark:hidden md:h-10"
      />
      {/* Mode nuit : logo blanc */}
      <Image
        src="/images/brand/logo-cinemergence.png"
        alt=""
        width={1668}
        height={586}
        priority
        aria-hidden
        className="hidden h-8 w-auto dark:block md:h-10"
      />
    </Link>
  );
}
