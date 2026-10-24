import Image from "next/image";
import Link from "next/link";

import { KHEIRON_FORMATION_PATH } from "@/lib/defaults";

export function HeroKheironCard() {
  return (
    <Link
      href={KHEIRON_FORMATION_PATH}
      className="group relative flex h-full min-h-14 overflow-visible focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-convert/50"
    >
      <div className="relative flex h-full min-h-[9rem] w-full overflow-hidden border border-white/10 transition-colors group-hover:border-white/25">
        <div
          className="pointer-events-none absolute inset-0 bg-[#151b22]/35 backdrop-blur-md"
          aria-hidden
        />
        <div className="relative z-10 flex h-full w-full">
          <div className="relative h-full w-[6.5rem] shrink-0 md:w-[7.75rem]">
            <Image
              src="/images/formations/masterclass-kheiron.webp"
              alt=""
              fill
              sizes="124px"
              className="object-cover object-[center_12%]"
            />
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-center px-4 py-4 text-center">
            <p className="font-heading text-base font-semibold leading-snug text-cream">
              Masterclass avec Kheiron
            </p>
          </div>
        </div>
      </div>
      <span className="hero-new-badge">NEW</span>
    </Link>
  );
}
