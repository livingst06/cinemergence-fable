import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Conservé pour compat — plus d’alternance de fond. */
  variant?: "default" | "secondary" | "dark";
  compact?: boolean;
};

export function Section({ children, className, id, compact = false }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        compact ? "py-6 md:py-8 lg:py-10" : "py-10 md:py-16 lg:py-28",
        className,
      )}
    >
      {children}
    </section>
  );
}

type SectionHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 md:mb-12 lg:mb-16",
        align === "center" && "mx-auto max-w-4xl text-center",
        align === "left" && "max-w-4xl text-left",
        className,
      )}
    >
      <h2 className={cn("section-title", align === "left" && "da-rule")}>{title}</h2>
      {description && (
        <div
          className={cn(
            "body-copy mt-4 text-pretty",
            align === "left" && "text-left md:text-justify",
          )}
        >
          {typeof description === "string" ? <p>{description}</p> : description}
        </div>
      )}
    </div>
  );
}
