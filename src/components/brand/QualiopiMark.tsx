import { cn } from "@/lib/utils";

type QualiopiMarkProps = {
  className?: string;
  size?: "sm" | "md";
  showTitle?: boolean;
};

/**
 * Marque Qualiopi conforme à la charte d’usage du ministère du Travail :
 * le visuel officiel intègre Marianne, « République française »
 * et la catégorie certifiée « Action de formation ».
 * Fond blanc uniquement, logo non modifié.
 */
export function QualiopiMark({
  className,
  size = "md",
  showTitle = true,
}: QualiopiMarkProps) {
  return (
    <figure
      className={cn(
        "flex w-full flex-col items-start gap-3 text-left",
        size === "sm" ? "max-w-[18rem]" : "max-w-[22rem]",
        className,
      )}
    >
      <div className="logo-plate flex w-full items-center justify-center rounded-xl p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/brand/qualiopi/qualiopi-action-formation.png"
          alt="Qualiopi, processus certifié — République française. La certification qualité a été délivrée au titre de la catégorie d'action suivante : action de formation."
          width={906}
          height={628}
          className="h-auto w-full object-contain"
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
