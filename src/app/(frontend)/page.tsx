import { statSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { preload } from "react-dom";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { HeroVideoBackground } from "@/components/sections/HeroVideoBackground";
import { Section, SectionHeader } from "@/components/ui/Section";
import { CtaFinal } from "@/features/home/CtaFinal";
import { FinanceurLogos } from "@/features/home/FinanceurLogos";
import { HeroProofCard } from "@/features/home/HeroProofCard";
import { StickyCta } from "@/features/home/StickyCta";
import { Temoignages } from "@/features/home/Temoignages";
import { FinancementSection } from "@/features/financement/FinancementSection";
import { FormationMiniCard } from "@/features/formations/FormationMiniCard";
import { IntervenantCard } from "@/features/intervenants/IntervenantCard";
import { NewsletterForm } from "@/features/contact/NewsletterForm";
import {
  getFinancementDispositifs,
  getFormations,
  getIntervenants,
  getSiteSettings,
  getTemoignages,
} from "@/lib/data";
import { PUBLIC_FINANCEMENT_KEYS } from "@/lib/formation-types";

export const revalidate = 300;

function heroPublicAsset(filename: string) {
  const href = `/videos/${filename}`;
  try {
    const mtime = statSync(path.join(process.cwd(), "public", "videos", filename)).mtimeMs;
    return `${href}?v=${Math.round(mtime)}`;
  } catch {
    return href;
  }
}

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
  const heroPoster = heroPublicAsset("hero-plateau-poster.jpg");
  preload(heroPoster, { as: "image" });

  const [site, formations, intervenants, temoignages, financement] = await Promise.all([
    getSiteSettings(),
    getFormations(),
    getIntervenants(),
    getTemoignages(),
    getFinancementDispositifs(),
  ]);

  const orderedFormations = [...formations].sort(
    (a, b) => Number(b.prioritaire) - Number(a.prioritaire),
  );

  return (
    <>
      <section className="cinematic-grain hero-slash relative overflow-hidden bg-noir md:min-h-[52.5vh]">
        <HeroVideoBackground
          src={heroPublicAsset("hero-plateau-travel.mp4")}
          srcMobile={heroPublicAsset("hero-plateau-travel-mobile.mp4")}
          poster={heroPoster}
        />
        <div className="container-page relative z-10 flex flex-col justify-start pt-6 pb-10 md:min-h-[52.5vh] md:pt-10 md:pb-20 lg:pt-12 lg:pb-24">
          <div className="w-full lg:w-3/4">
            <p className="eyebrow animate-fade-up">Paris · Marseille · Montpellier</p>
            <h1 className="display-title mt-3 animate-fade-up-delay-1 text-[clamp(1.9rem,11vw,6.25rem)] text-cream md:mt-6">
              Cinémergence
            </h1>
            <p className="mt-3 animate-fade-up-delay-1 text-base font-heading text-cool-glow md:mt-4 md:text-xl">
              Le cinéma, en conditions réelles.
            </p>
          </div>
          <p className="mt-4 w-full max-w-5xl animate-fade-up-delay-2 text-pretty text-[clamp(1.15rem,4.2vw,3rem)] leading-snug text-cream/85 md:mt-6">
            Une immersion totale sur de vrais plateaux avec un livrable concret pour chaque parcours.
          </p>
          <div className="mt-6 w-full max-w-xl animate-fade-up-delay-2 md:mt-8">
            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
              <ButtonLink href="/formations" size="lg" className="btn-cta min-h-12 w-full px-8 sm:w-auto sm:px-10">
                Voir les formations
              </ButtonLink>
              <ButtonLink
                href="/contact"
                size="lg"
                className="btn-outline-warm min-h-12 w-full rounded-lg px-8 py-2.5 text-sm font-semibold uppercase tracking-wider sm:w-auto sm:px-10"
              >
                Je réserve ma place
              </ButtonLink>
            </div>
            <div className="mt-6 md:mt-10">
              <HeroProofCard nda={site.nda} />
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
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                <p className="min-w-0 flex-1 text-left leading-relaxed md:text-justify">{item}</p>
              </li>
            ))}
            {PUBLIC_FINANCEMENT_KEYS.length > 0 && (
              <li className="flex items-center sm:col-span-2 lg:col-span-1">
                <FinanceurLogos className="grid w-full grid-cols-3 justify-items-center gap-2" />
              </li>
            )}
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
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {orderedFormations.map((formation) => (
              <FormationMiniCard key={formation.slug} formation={formation} />
            ))}
          </div>
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
