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
    <figure className={cn("flex items-start gap-4 text-left", className)}>
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
      <figcaption className="min-w-0 pt-0.5">
        {showTitle && (
          <p className="text-sm font-semibold leading-snug text-cream">
            Organisme de formation certifié jusqu&apos;au 17 août 2029
          </p>
        )}
        <p
          className={cn(
            "text-[11px] leading-relaxed text-cream/70",
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
  );
}
