type LegalPageProps = {
  title: string;
  content: string;
};

export function LegalPageContent({ title, content }: LegalPageProps) {
  return (
    <article className="prose prose-invert max-w-none">
      <h1 className="font-heading text-4xl text-cream">{title}</h1>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-text whitespace-pre-line">
        {content}
      </div>
    </article>
  );
}
