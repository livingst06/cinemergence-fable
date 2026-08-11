import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: React.ReactNode;
};

export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-noir pt-10 pb-8 sm:pt-12 sm:pb-10 md:pt-14 md:pb-12">
      <div className="container-page">
        {eyebrow && <p className="eyebrow mb-3 md:mb-4">{eyebrow}</p>}
        <h1 className="display-title max-w-4xl text-cream md:max-w-5xl">{title}</h1>
        {description && (
          <div className="mt-4 max-w-3xl text-base leading-relaxed text-muted-text md:mt-5 md:max-w-4xl md:text-justify">
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
