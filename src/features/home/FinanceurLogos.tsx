import { FinanceurLogo } from "@/components/brand/FinanceurLogo";
import { PUBLIC_FINANCEMENT_KEYS } from "@/lib/formation-types";
import { cn } from "@/lib/utils";

type FinanceurLogosProps = {
  className?: string;
};

export function FinanceurLogos({ className }: FinanceurLogosProps) {
  if (PUBLIC_FINANCEMENT_KEYS.length === 0) return null;

  return (
    <ul
      className={cn("flex flex-wrap items-center justify-center gap-2", className)}
      aria-label="Organismes financeurs"
    >
      {PUBLIC_FINANCEMENT_KEYS.map((key) => (
        <li key={key}>
          <FinanceurLogo financeurKey={key} size="sm" className="w-full" />
        </li>
      ))}
    </ul>
  );
}
