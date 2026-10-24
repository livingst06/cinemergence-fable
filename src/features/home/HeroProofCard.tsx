import { QualiopiMark } from "@/components/brand/QualiopiMark";
import { NdaNumber } from "@/components/NdaNumber";
import { FinanceurLogos } from "@/features/home/FinanceurLogos";
import { PUBLIC_FINANCEMENT_KEYS } from "@/lib/formation-types";
import { cn } from "@/lib/utils";

type HeroProofCardProps = {
  nda: string;
  className?: string;
};

export function HeroProofCard({ nda, className }: HeroProofCardProps) {
  return (
    <div className={cn("relative h-full overflow-hidden rounded-none border border-white/10", className)}>
      <div
        className="pointer-events-none absolute inset-0 bg-[#151b22]/35 backdrop-blur-md"
        aria-hidden
      />
      <div className="relative z-10">
        <div className="p-4 md:p-6">
          <QualiopiMark size="sm" />
          <p className="caption-copy mt-3 font-heading text-cream/50">
            NDA <NdaNumber nda={nda} />
          </p>
        </div>
        {PUBLIC_FINANCEMENT_KEYS.length > 0 && (
          <div className="border-t border-white/10 px-4 py-3 md:px-6 md:py-4">
            <FinanceurLogos />
          </div>
        )}
      </div>
    </div>
  );
}
