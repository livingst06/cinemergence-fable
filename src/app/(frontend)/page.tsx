import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { HeroVideoBackground } from "@/components/sections/HeroVideoBackground";
import { Section, SectionHeader } from "@/components/ui/Section";
import { CtaFinal } from "@/features/home/CtaFinal";
import { FinanceurLogos } from "@/features/home/FinanceurLogos";
import { FormationsCarousel } from "@/features/home/FormationsCarousel";
import { HeroProofCard } from "@/features/home/HeroProofCard";
import { StickyCta } from "@/features/home/StickyCta";
import { Temoignages } from "@/features/home/Temoignages";
import { FinancementSection } from "@/features/financement/FinancementSection";
import { IntervenantCard } from "@/features/intervenants/IntervenantCard";
import { NewsletterForm } from "@/features/contact/NewsletterForm";
import {
  getFinancementDispositifs,
  getFormations,
  getIntervenants,
  getSiteSettings,
  getTemoignages,
} from "@/lib/data";
import { resolveFormationCoverUrl } from "@/lib/site-media";

export const revalidate = 300;

const schoolBenefits = [
  "Conditions réelles de plateau",
  "Direction d'acteur & encadrement pro",
  "Matériel cinéma professionnel",
  "Livrable concret par formation",
  "Montage / post-prod selon parcours",
];

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: "École de formation cinéma Paris — Cinémergence",
    description: site.description,
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const [site, formations, intervenants, temoignages, financement] = await Promise.all([
    getSiteSettings(),
    getFormations(),
    getIntervenants(),
    getTemoignages(),
    getFinancementDispositifs(),
  ]);

  const formationSlides = [...formations]
    .sort((a, b) => Number(b.prioritaire) - Number(a.prioritaire))
    .map((f) => ({
      slug: f.slug,
      titre: f.titre,
      src: resolveFormationCoverUrl(f.slug, f.coverImageUrl),
      alt: f.titre,
    }));

  return (
    <>
      <section className="cinematic-grain hero-slash relative min-h-[49vh] overflow-hidden bg-noir md:min-h-[52.5vh]">
        <HeroVideoBackground />
        <div className="container-page relative z-10 flex min-h-[49vh] flex-col justify-start pt-8 pb-16 md:min-h-[52.5vh] md:pt-10 md:pb-20 lg:pt-12 lg:pb-24">
          <div className="w-full lg:w-3/4">
            <p className="eyebrow animate-fade-up">Paris · Marseille · Montpellier</p>
            <h1 className="display-title mt-6 animate-fade-up-delay-1 text-[clamp(2.8rem,7.5vw,6.25rem)] text-cream">
              Cinémergence
            </h1>
            <p className="mt-4 animate-fade-up-delay-1 text-lg font-heading text-cool-glow md:text-xl">
              Le cinéma, en conditions réelles.
            </p>
          </div>
          <p className="mt-6 w-full animate-fade-up-delay-2 text-4xl leading-snug text-cream/85 md:text-[2.5rem] lg:text-5xl">
            Une immersion totale sur de vrais&nbsp;plateaux
            <br />
            avec un livrable concret pour chaque&nbsp;parcours.
          </p>
          <div className="mt-8 w-full max-w-xl animate-fade-up-delay-2">
            <HeroProofCard nda={site.nda} />
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href="/formations" size="lg" className="btn-cta px-10">
                Voir les formations
              </ButtonLink>
              <ButtonLink
                href="/contact"
                size="lg"
                className="btn-outline-warm rounded-lg px-10 py-2.5 text-sm font-semibold uppercase tracking-wider"
              >
                Je réserve ma place
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <Section>
        <div className="container-page">
          <SectionHeader
            eyebrow="Intervenants"
            title="Nos intervenants"
            description="Des professionnels en activité qui transmettent leur exigence sur le plateau."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {intervenants
              .filter(
                (i) =>
                  (i.categorie ?? "professionnel") === "professionnel" &&
                  i.slug !== "karina-testa",
              )
              .map((i) => (
                <IntervenantCard key={i.slug} intervenant={i} />
              ))}
          </div>
        </div>
      </Section>

      <Section id="apropos">
        <div className="container-page">
          <SectionHeader
            eyebrow="L'école"
            title={"Une immersion totale sur un vrai\u00a0plateau"}
            description={
              <>
                <p>
                  Cinémergence forme comédiens, techniciens et entreprises en conditions
                  réelles
                </p>
                <p className="mt-1">
                  avec le même niveau d&apos;exigence que sur un&nbsp;tournage.
                </p>
              </>
            }
          />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {schoolBenefits.map((item) => (
              <li
                key={item}
                className="card-stage flex items-start gap-3 p-4 text-sm text-cream/90"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-projector shadow-[0_0_6px_var(--projector-glow)]"
                  aria-hidden
                />
                <p className="min-w-0 flex-1 text-justify leading-relaxed">{item}</p>
              </li>
            ))}
            <li className="flex items-center sm:col-span-2 lg:col-span-1">
              <FinanceurLogos className="grid w-full grid-cols-2 justify-items-center gap-2" />
            </li>
          </ul>
        </div>
      </Section>

      <Section id="formations">
        <div className="container-page">
          <SectionHeader
            eyebrow="Catalogue"
            title="Nos formations"
            description={
              <>
                <p>Des parcours professionnalisants,</p>
                <p className="mt-1">chacun avec un livrable clair pour l'élève.</p>
              </>
            }
          />
          <FormationsCarousel slides={formationSlides} />
          <div className="mt-10 text-center">
            <ButtonLink href="/formations" size="lg" className="btn-cta px-10">
              Voir toutes les formations
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="Production"
              title="Matériel cinéma"
              align="left"
              className="mb-6"
            />
            <div className="space-y-4 text-sm leading-relaxed text-muted-text">
              <p>
                Nous tournons avec des caméras RED ou ARRI — le standard du cinéma et des
                plateformes. Tu travailles avec le même type de matériel que sur les plateaux
                professionnels.
              </p>
              <p className="font-medium text-cream">
                Objectif : une image conforme aux exigences du marché, exploitable par agents,
                directeurs de casting et productions.
              </p>
            </div>
          </div>
          <div>
            <SectionHeader
              eyebrow="Projets"
              title={"Un tremplin vers la\u00a0production"}
              align="left"
              className="mb-6"
            />
            <div className="space-y-4 text-sm leading-relaxed text-muted-text">
              <p>
                Notre ambition dépasse la salle de formation : créer un lien durable entre
                formation et production, avec Bakelite Films, notre société partenaire.
              </p>
              <p className="font-medium text-cream">
                Formation, tournage et création se rejoignent pour donner une chance aux talents
                d&apos;être vus.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Temoignages temoignages={temoignages} />
      <FinancementSection dispositifs={financement} />

      <Section>
        <div className="container-page mx-auto max-w-xl text-center">
          <SectionHeader
            eyebrow="Newsletter"
            title="Les prochaines sessions"
            description="Sois informé·e des dates et des ouvertures de nos formations."
          />
          <NewsletterForm />
        </div>
      </Section>

      <CtaFinal site={site} />
      <StickyCta />
    </>
  );
}
