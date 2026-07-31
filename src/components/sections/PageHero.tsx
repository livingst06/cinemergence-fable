import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: React.ReactNode;
};

export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-noir pt-12 pb-10 md:pt-16 md:pb-14">
      <div className="container-page">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="display-title max-w-5xl text-cream">{title}</h1>
        {description && (
          <div className="mt-5 max-w-4xl text-justify text-base leading-relaxed text-muted-text">
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
