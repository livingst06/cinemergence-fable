import type { Metadata } from "next";

import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { LegalPageContent } from "@/features/legal/LegalPageContent";
import { defaultLegal } from "@/lib/defaults";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <>
      <PageHero title="Politique de confidentialité" />
      <Section>
        <div className="container-page max-w-3xl">
          <LegalPageContent title="Politique de confidentialité (RGPD)" content={defaultLegal.confidentialite} />
          <section className="mt-8 space-y-3 text-justify text-sm leading-relaxed text-muted-text">
            <h2 className="font-heading text-2xl text-cream">Mesure d&apos;audience et publicité</h2>
            <p>
              Avec ton accord, nous utilisons Google Analytics pour mesurer la fréquentation du site,
              et les outils de Meta (pixel et API Conversions) pour mesurer l&apos;efficacité de nos
              publicités sur Facebook et Instagram. Ces données transitent par notre serveur de mesure,
              wisdom.cinemergence.fr, opéré par Addingwell. Lors d&apos;une inscription payée, ton adresse
              e-mail, ton téléphone, ton nom et ton adresse de facturation peuvent être transmis à Meta
              sous forme hachée, c&apos;est-à-dire rendue illisible, uniquement si tu as accepté les
              cookies, pour rattacher l&apos;inscription à la publicité qui l&apos;a amenée. Les cookies
              de mesure sont conservés 13 mois au plus. Tu peux retirer ton accord à tout moment depuis
              « Gérer les cookies ».
            </p>
          </section>
        </div>
      </Section>
    </>
  );
}
