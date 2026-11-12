import { cn } from "@/lib/utils";

type QualiopiMarkProps = {
  className?: string;
  size?: "sm" | "md";
  showTitle?: boolean;
  /** Hero : visuel plus bas, proportions du logo inchangées. */
  compact?: boolean;
};

/**
 * Marque Qualiopi conforme à la charte d’usage du ministère du Travail :
 * le visuel officiel intègre Marianne, « République française »
 * et la catégorie certifiée « Action de formation ».
 * Fond blanc uniquement, logo non modifié.
 * Sur mobile, le bloc est réduit d’un quart : la signature reste
 * au-dessus du minimum de la charte graphique (23 × 10 mm).
 */
export function QualiopiMark({
  className,
  size = "md",
  showTitle = true,
  compact = false,
}: QualiopiMarkProps) {
  return (
    <figure
      className={cn(
        "flex w-full flex-col items-start text-left",
        compact ? "gap-1.5" : "gap-3",
        size === "sm"
          ? "max-w-[18rem] max-md:w-3/4 max-md:max-w-[13.5rem]"
          : "max-w-[22rem] max-md:w-3/4 max-md:max-w-[16.5rem]",
        className,
      )}
    >
      <div
        className={cn(
          "logo-plate flex items-center justify-center rounded-xl",
          compact ? "w-fit p-1.5" : "w-full p-3",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/brand/qualiopi/qualiopi-action-formation.png"
          alt="Qualiopi, processus certifié — République française. La certification qualité a été délivrée au titre de la catégorie d'action suivante : action de formation."
          width={906}
          height={628}
          className={cn(
            "object-contain",
            compact ? "h-[6.75rem] w-auto md:h-[8.5rem]" : "h-auto w-full",
          )}
        />
      </div>
      {showTitle && (
        <figcaption>
          <p className="text-sm font-heading font-semibold leading-snug text-cream">
            Organisme de formation certifié jusqu&apos;au{" "}
            <span className="whitespace-nowrap">17 août 2029</span>
          </p>
        </figcaption>
      )}
    </figure>
  );
}
