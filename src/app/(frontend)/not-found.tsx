import { ButtonLink } from "@/components/ui/ButtonLink";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display-title mt-4 text-cream">Page introuvable</h1>
      <p className="mt-4 max-w-md text-muted-text">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <ButtonLink href="/" className="mt-8 btn-cta">
        Retour à l&apos;accueil
      </ButtonLink>
    </section>
  );
}
