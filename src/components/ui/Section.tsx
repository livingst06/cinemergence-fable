import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Conservé pour compat — plus d’alternance de fond. */
  variant?: "default" | "secondary" | "dark";
};

export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("py-14 sm:py-16 md:py-20 lg:py-24", className)}>
      {children}
    </section>
  );
}

type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 sm:mb-10 md:mb-12",
        align === "center" && "mx-auto max-w-3xl text-center md:max-w-4xl",
        align === "left" && "max-w-3xl md:max-w-4xl",
        className,
      )}
    >
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className="section-title text-cream">{title}</h2>
      {description && (
        <div
          className={cn(
            "mt-4 text-pretty text-base leading-relaxed text-muted-text md:text-lg",
            align === "left" && "text-justify",
          )}
        >
          {typeof description === "string" ? <p>{description}</p> : description}
        </div>
      )}
    </div>
  );
}
