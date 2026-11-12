import Image from "next/image";
import Link from "next/link";

import { KHEIRON_FORMATION_PATH } from "@/lib/defaults";

export function HeroKheironCard() {
  return (
    <Link
      href={KHEIRON_FORMATION_PATH}
      className="group relative flex h-full min-h-14 overflow-visible focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-convert/50"
    >
      <div className="relative h-full w-full overflow-hidden rounded-none border border-white/10 transition-colors group-hover:border-white/25">
        <div
          className="pointer-events-none absolute inset-0 bg-[#151b22]/35 backdrop-blur-md"
          aria-hidden
        />
        {/* Même composition que HeroProofCard : visuel à gauche, texte à droite. */}
        <div className="relative z-10 flex h-full items-center gap-3 p-2 md:gap-4 md:p-2.5">
          {/* Hauteur = plaque Qualiopi (img + p-1.5), pas seulement l’img. */}
          <div className="relative h-[7.5rem] w-[5.75rem] shrink-0 overflow-hidden rounded-xl md:h-[9.25rem] md:w-[7rem]">
            <Image
              src="/images/formations/masterclass-kheiron.webp"
              alt=""
              fill
              sizes="124px"
              className="object-cover object-[center_12%]"
            />
          </div>
          <div className="min-w-0">
            <p className="font-heading text-sm font-semibold leading-snug text-cream">
              Masterclass avec Kheiron
            </p>
          </div>
        </div>
      </div>
      <span className="hero-new-badge">NEW</span>
    </Link>
  );
}
