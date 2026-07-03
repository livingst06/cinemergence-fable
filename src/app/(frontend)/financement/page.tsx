import type { Metadata } from "next";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section, SectionHeader } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { FinancementGuide } from "@/features/financement/FinancementGuide";
import { FinancementSection } from "@/features/financement/FinancementSection";
import { ContactForm } from "@/features/contact/ContactForm";
import { getFinancementDispositifs, getFormations } from "@/lib/data";

const faq = [
  {
    q: "Combien je paie de ma poche ?",
    r: "Ça dépend de ton dispositif et de ta situation. Parfois 0 €. On t'aide à faire le point avant de t'inscrire.",
  },
  {
    q: "Combien de temps pour monter un dossier ?",
    r: "Compte 2 à 6 semaines selon le financeur. On t'accompagne dans les démarches.",
  },
  {
    q: "Puis-je cumuler plusieurs financements ?",
    r: "En général non pour une même formation. On vérifie avec toi le dispositif le plus adapté.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Financement formation cinéma — AFDAS, OPCO, CPF",
    description:
      "Finance ta formation cinéma à Paris : AFDAS, OPCO, CPF, France Travail. Guide par profil et accompagnement Cinémergence.",
    alternates: { canonical: "/financement" },
  };
}

export default async function FinancementPage() {
  const [formations, dispositifs] = await Promise.all([
    getFormations(),
    getFinancementDispositifs(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Financement"
        title="Ton projet peut être pris en charge"
        description="AFDAS, OPCO, CPF, France Travail — on t'explique simplement comment financer ta formation."
      />
      <Section>
        <div className="container-page">
          <FinancementGuide />
        </div>
      </Section>
      <FinancementSection dispositifs={dispositifs} />
      <Section variant="secondary">
        <div className="container-page max-w-3xl">
          <SectionHeader eyebrow="FAQ" title="Les vraies questions" align="left" />
          <Accordion className="w-full">
            {faq.map((item, i) => (
              <AccordionItem key={item.q} value={`faq-${i}`} className="border-or/15">
                <AccordionTrigger className="text-cream hover:text-or">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-text">{item.r}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>
      <Section>
        <div className="container-page max-w-2xl">
          <SectionHeader
            eyebrow="Contact"
            title="Je veux vérifier mon financement"
            align="left"
          />
          <ContactForm
            formations={formations.map((f) => ({
              slug: f.slug,
              titreCourt: f.titreCourt,
            }))}
            defaultType="financement"
          />
        </div>
      </Section>
    </>
  );
}
