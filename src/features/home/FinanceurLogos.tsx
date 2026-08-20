import { FinanceurLogo, FINANCEUR_LOGOS } from "@/components/brand/FinanceurLogo";
import { cn } from "@/lib/utils";

type FinanceurLogosProps = {
  className?: string;
};

export function FinanceurLogos({ className }: FinanceurLogosProps) {
  return (
    <ul
      className={cn("flex flex-wrap items-center justify-center gap-2", className)}
      aria-label="Finançable AFDAS, OPCO, CPF, France Travail"
    >
      {(Object.keys(FINANCEUR_LOGOS) as Array<keyof typeof FINANCEUR_LOGOS>).map((key) => (
        <li key={key}>
          <FinanceurLogo financeurKey={key} size="sm" className="w-full" />
        </li>
      ))}
    </ul>
  );
}
