import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: React.ReactNode;
  headingAs?: "h1" | "h2";
};

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  headingAs: Heading = "h1",
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-noir pt-8 pb-8 md:pt-16 md:pb-14">
      <div className="container-page">
        {eyebrow && <p className="eyebrow mb-3 md:mb-4">{eyebrow}</p>}
        <Heading className="display-title max-w-5xl text-cream">{title}</Heading>
        {description && (
          <div className="mt-4 max-w-4xl text-left text-base leading-relaxed text-muted-text md:mt-5 md:text-justify">
            {typeof description === "string" ? (
              <p className="text-pretty">{description}</p>
            ) : (
              description
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
