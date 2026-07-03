type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="plateau-bg cinematic-grain relative overflow-hidden border-b border-white/[0.06] bg-noir pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="container-page relative z-10">
        {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
        <h1 className="display-title max-w-4xl text-cream">{title}</h1>
        {description && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-text">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}
