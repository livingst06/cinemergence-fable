import { ButtonLink } from "@/components/ui/ButtonLink";
import type { SiteConfig } from "@/lib/data";

type CtaFinalProps = {
  site: SiteConfig;
};

export function CtaFinal({ site }: CtaFinalProps) {
  return (
    <section className="plateau-bg cinematic-grain relative overflow-hidden bg-noir-tertiary py-24 md:py-32">
      <div className="container-page relative z-10 text-center">
        <p className="eyebrow mb-5 justify-center">Inscription</p>
        <h2 className="display-title mx-auto max-w-4xl text-cream">
          Prêt à passer
          <br />
          <span className="text-tungsten">à l&apos;action ?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-text md:text-lg">
          {site.tagline} Contacte-nous par email ou WhatsApp au{" "}
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="text-or-light hover:underline">
            {site.phone}
          </a>
          .
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ButtonLink href="/contact" size="lg" className="btn-cta px-10">
            Je m&apos;inscris
          </ButtonLink>
          <ButtonLink
            href={`https://wa.me/${site.phone.replace(/\D/g, "")}`}
            size="lg"
            className="btn-outline-warm rounded-lg px-10 py-2.5 text-sm font-semibold uppercase tracking-wider"
          >
            WhatsApp
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
