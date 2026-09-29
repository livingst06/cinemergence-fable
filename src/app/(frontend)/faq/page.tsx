import type { Metadata } from "next";

import { PageHero } from "@/components/sections/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section, SectionHeader } from "@/components/ui/Section";
import { faqSections } from "@/lib/faq";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "FAQ — Cinémergence",
    description:
      "Questions fréquentes sur Cinémergence : formations cinéma, certification Qualiopi, financement et inscription à Paris.",
    alternates: { canonical: "/faq" },
  };
}

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Foire aux questions"
        description={
          <p className="text-lg leading-relaxed md:text-xl md:leading-relaxed">
            Les réponses essentielles sur Cinémergence, les formations, le financement et
            l&apos;inscription.
          </p>
        }
      />

      {faqSections.map((section) => (
        <Section key={section.id} id={section.id}>
          <div className="container-page max-w-3xl">
            <SectionHeader
              eyebrow={section.eyebrow}
              title={section.title}
              align="left"
              className="mb-6 md:mb-8"
            />
            <Accordion className="w-full">
              {section.items.map((item, i) => (
                <AccordionItem
                  key={item.q}
                  value={`${section.id}-${i}`}
                  className="border-or/15"
                >
                  <AccordionTrigger className="py-3.5 text-lg font-semibold leading-snug text-cream hover:text-or md:text-xl">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-lg leading-relaxed text-muted-text md:text-xl">
                    {item.r}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {section.id === "qualiopi-financement" && (
              <div className="mt-8">
                <ButtonLink
                  href="/financement"
                  className="btn-outline-warm rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wider"
                >
                  Je vérifie mon financement
                </ButtonLink>
              </div>
            )}
          </div>
        </Section>
      ))}

      <Section>
        <div className="container-page max-w-3xl border-t border-white/[0.06] pt-12 text-center md:pt-16">
          <h2 className="section-title text-cream">Une autre question&nbsp;?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-text">
            Écris-nous pour une inscription, un devis ou un projet de financement.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/contact" size="lg" className="btn-cta">
              Je vous contacte
            </ButtonLink>
            <ButtonLink
              href="/financement"
              className="btn-outline-warm rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wider"
            >
              Je vérifie mon financement
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
