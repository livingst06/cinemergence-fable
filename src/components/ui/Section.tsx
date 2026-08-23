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
    <section id={id} className={cn("py-10 md:py-14 lg:py-16", className)}>
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
        "mb-8 md:mb-10",
        align === "center" && "mx-auto max-w-4xl text-center",
        align === "left" && "max-w-4xl text-left",
        className,
      )}
    >
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="section-title text-cream">{title}</h2>
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
