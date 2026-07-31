import { ButtonLink } from "@/components/ui/ButtonLink";
import type { SiteConfig } from "@/lib/data";
import Link from "next/link";

type CtaFinalProps = {
  site: SiteConfig;
};

export function CtaFinal({ site }: CtaFinalProps) {
  return (
    <section className="border-t border-border bg-noir py-24 md:py-32">
      <div className="container-page text-center">
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
            Réserver ma place
          </ButtonLink>
          <ButtonLink
            href={`https://wa.me/${site.phone.replace(/\D/g, "")}`}
            size="lg"
            className="btn-outline-warm rounded-lg px-10 py-2.5 text-sm font-semibold uppercase tracking-wider"
          >
            WhatsApp
          </ButtonLink>
        </div>

        <ul className="mx-auto mt-10 flex max-w-3xl flex-col gap-2 text-center text-xs text-muted-text sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2">
          <li>Inscription accompagnée · devis &amp; facture</li>
          <li>Organisme déclaré · NDA {site.nda}</li>
          <li>
            <a href={`mailto:${site.email}`} className="hover:text-or-light">
              {site.email}
            </a>
          </li>
          <li>
            <Link href="/cgv" className="hover:text-or-light">
              CGV &amp; annulation
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
