import type { FinancementKey } from "@/lib/formation-types";
import { cn } from "@/lib/utils";

export const FINANCEUR_LOGOS: Record<FinancementKey, { name: string; src: string }> = {
  afdas: { name: "AFDAS", src: "/images/brand/financeurs/afdas.svg" },
  opco: { name: "OPCO", src: "/images/brand/financeurs/opco.svg" },
  cpf: { name: "CPF", src: "/images/brand/financeurs/cpf.svg" },
  "france-travail": { name: "France Travail", src: "/images/brand/financeurs/france-travail.svg" },
};

type FinanceurLogoProps = {
  financeurKey: FinancementKey;
  className?: string;
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: {
    plate: "h-10 px-2.5 py-1.5",
    img: "h-6 max-w-[6.5rem]",
  },
  md: {
    plate: "h-12 px-3 py-2",
    img: "h-7 max-w-[9rem]",
  },
} as const;

export function FinanceurLogo({ financeurKey, className, size = "md" }: FinanceurLogoProps) {
  const logo = FINANCEUR_LOGOS[financeurKey];
  if (!logo) return null;
  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        "logo-plate flex w-fit max-w-full items-center justify-center overflow-hidden rounded-md",
        sizes.plate,
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.src}
        alt=""
        className={cn("relative z-[1] w-auto object-contain object-center", sizes.img)}
      />
    </div>
  );
}
