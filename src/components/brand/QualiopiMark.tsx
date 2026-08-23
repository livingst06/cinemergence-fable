import { cn } from "@/lib/utils";

type QualiopiMarkProps = {
  className?: string;
  size?: "sm" | "md";
  showTitle?: boolean;
};

/**
 * Marque Qualiopi conforme à la charte d’usage du ministère du Travail :
 * - logo intégral avec bandeau Marianne + « République Française » (non modifié)
 * - fond blanc uniquement derrière le logo
 * - mention obligatoire de la catégorie certifiée
 */
export function QualiopiMark({
  className,
  size = "md",
  showTitle = true,
}: QualiopiMarkProps) {
  const logoHeight = size === "sm" ? "h-14" : "h-16";

  return (
    <div className={cn("@container w-full", className)}>
      <figure className="flex flex-col items-start gap-3 text-left @min-[22rem]:flex-row @min-[22rem]:items-start @min-[22rem]:gap-4">
        <div className="logo-plate flex shrink-0 items-center justify-center rounded-xl p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brand/qualiopi/qualiopi-marianne.png"
            alt="Qualiopi, processus certifié — République Française"
            width={633}
            height={338}
            className={cn("w-auto object-contain", logoHeight)}
          />
        </div>
        <figcaption className="min-w-0 w-full pt-0.5 @min-[22rem]:flex-1">
          {showTitle && (
            <p className="text-sm font-heading font-semibold leading-snug text-cream">
              Organisme de formation certifié jusqu&apos;au 17 août 2029
            </p>
          )}
          <p
            className={cn(
              "caption-copy font-heading text-cream/70",
              showTitle && "mt-1",
            )}
          >
            La certification qualité a été délivrée au titre de la ou des
            catégories d&apos;actions suivantes :{" "}
            <strong className="font-semibold text-cream">
              Actions de formation
            </strong>
          </p>
        </figcaption>
      </figure>
    </div>
  );
}
