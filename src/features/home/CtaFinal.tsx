import { ButtonLink } from "@/components/ui/ButtonLink";
import type { SiteConfig } from "@/lib/data";
import Link from "next/link";

type CtaFinalProps = {
  site: SiteConfig;
};

export function CtaFinal({ site }: CtaFinalProps) {
  return (
    <section className="border-t border-border bg-noir py-14 md:py-20 lg:py-24">
      <div className="container-page text-center">
        <h2 className="display-title mx-auto max-w-4xl text-cream">
          Prêt à passer <span className="text-tungsten">à l&apos;action&nbsp;?</span>
        </h2>
        <p className="body-copy mx-auto mt-6 max-w-3xl text-pretty">
          {site.tagline} Contacte-nous par email ou WhatsApp au{" "}
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="text-or-light hover:underline">
            {site.phone}
          </a>
          .
        </p>
        <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
          <ButtonLink href="/contact" size="lg" className="btn-cta min-h-12 w-full px-8 sm:w-auto sm:px-10">
            Je réserve ma place
          </ButtonLink>
          <ButtonLink
            href={`https://wa.me/${site.phone.replace(/\D/g, "")}`}
            size="lg"
            className="btn-outline-warm min-h-12 w-full rounded-lg px-8 py-2.5 text-sm font-semibold uppercase tracking-wider sm:w-auto sm:px-10"
          >
            Je vous contacte sur WhatsApp
          </ButtonLink>
        </div>

        <ul className="caption-copy mx-auto mt-10 flex max-w-3xl flex-col gap-2 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2">
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
