import { cn } from "@/lib/utils";

const financeurs = [
  { name: "AFDAS", src: "/images/brand/financeurs/afdas.svg" },
  { name: "OPCO", src: "/images/brand/financeurs/opco.svg" },
  { name: "CPF", src: "/images/brand/financeurs/cpf.svg" },
  { name: "France Travail", src: "/images/brand/financeurs/france-travail.svg" },
] as const;

type FinanceurLogosProps = {
  className?: string;
};

export function FinanceurLogos({ className }: FinanceurLogosProps) {
  return (
    <ul
      className={cn("flex flex-wrap items-center justify-center gap-2", className)}
      aria-label="Finançable AFDAS, OPCO, CPF, France Travail"
    >
      {financeurs.map((logo) => (
        <li key={logo.name}>
          <div className="logo-plate flex h-10 w-full items-center justify-center overflow-hidden rounded-md px-2.5 py-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.src}
              alt={logo.name}
              className="relative z-[1] h-6 w-auto max-w-[6.5rem] object-contain object-center"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
