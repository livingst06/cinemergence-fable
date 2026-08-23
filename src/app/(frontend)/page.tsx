import { statSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { preload } from "react-dom";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { HeroVideoBackground } from "@/components/sections/HeroVideoBackground";
import { Section, SectionHeader } from "@/components/ui/Section";
import { CtaFinal } from "@/features/home/CtaFinal";
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

export const revalidate = 300;

const materielCinema = [
  {
    src: "/images/materiel/arri-camera.webp",
    alt: "Caméra cinéma ARRI Alexa Mini LF",
    label: "ARRI Alexa Mini LF",
  },
  {
    src: "/images/materiel/red-camera.webp",
    alt: "Caméra cinéma RED V-Raptor XL",
    label: "RED V-Raptor XL",
  },
  {
    src: "/images/materiel/ronin-stabilizer.webp",
    alt: "Stabilisateur Ronin",
    label: "Stabilisateur Ronin",
  },
] as const;

function heroPublicAsset(filename: string) {
  const href = `/videos/${filename}`;
  try {
    const mtime = statSync(path.join(process.cwd(), "public", "videos", filename)).mtimeMs;
    return `${href}?v=${Math.round(mtime)}`;
  } catch {
    return href;
  }
}

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
      <section className="cinematic-grain relative overflow-hidden bg-noir md:min-h-[52.5vh]">
        <HeroVideoBackground
          src={heroPublicAsset("hero-plateau-travel.mp4")}
          srcMobile={heroPublicAsset("hero-plateau-travel-mobile.mp4")}
          poster={heroPoster}
        />
        <div className="hero-slash-edge" aria-hidden />
        <div className="container-page relative z-10 flex flex-col justify-start pt-6 pb-10 md:min-h-[52.5vh] md:pt-10 md:pb-20 lg:pt-12 lg:pb-24">
          <div className="w-full lg:w-3/4">
            <p className="eyebrow animate-fade-up">Paris · Marseille · Montpellier</p>
            <h1 className="display-title mt-3 animate-fade-up-delay-1 text-cream md:mt-6">
              Cinémergence
            </h1>
            <p className="mt-3 animate-fade-up-delay-1 font-heading text-lg leading-snug text-cool-glow md:mt-4 md:text-xl">
              Le cinéma, en conditions réelles.
            </p>
          </div>
          <ul className="mt-5 w-full max-w-3xl animate-fade-up-delay-2 space-y-2 text-base leading-relaxed text-cream/85 md:mt-6 md:text-lg">
            {[
              "Une immersion totale sur de vrais plateaux",
              "Direction d'acteur et encadrement pro",
              "Matériel cinéma professionnel",
              "Un livrable concret pour chaque parcours",
              "Montage / post-prod selon le parcours",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 md:gap-4">
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-projector shadow-[0_0_6px_var(--projector-glow)]"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 w-full max-w-xl animate-fade-up-delay-2 md:mt-8">
            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-start">
              <ButtonLink href="/contact" size="lg" className="btn-cta min-h-12 w-full px-8 sm:w-auto sm:px-10">
                Je réserve ma place
              </ButtonLink>
              <ButtonLink
                href="/formations"
                size="lg"
                className="btn-outline-warm min-h-12 w-full rounded-lg px-8 py-2.5 text-sm font-semibold uppercase tracking-wider sm:w-auto sm:px-10"
              >
                Voir les formations
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
            align="left"
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

      <Section id="formations">
        <div className="container-page">
          <SectionHeader
            eyebrow="Catalogue"
            title="Nos formations"
            align="left"
            description={
              <>
                <p>Des parcours professionnalisants,</p>
                <p className="mt-1">chacun avec un livrable clair pour l&apos;élève.</p>
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
        <div className="container-page space-y-12 md:space-y-16">
          <div>
            <SectionHeader
              eyebrow="Production"
              title="Matériel cinéma"
              align="left"
              className="mb-6"
            />
            <div className="body-copy space-y-4">
              <p>
                Nous tournons avec des caméras RED ou ARRI, et des stabilisateurs Ronin — le
                standard du cinéma et des plateformes. Tu travailles avec le même type de
                matériel que sur les plateaux professionnels.
              </p>
              <p className="font-medium text-cream">
                Objectif : une image conforme aux exigences du marché, exploitable par agents,
                directeurs de casting et productions.
              </p>
            </div>
            <ul className="mt-8 grid grid-cols-3 items-end gap-4 md:gap-6">
              {materielCinema.map((item) => (
                <li key={item.src} className="text-center">
                  <div className="relative mx-auto h-28 w-full md:h-40">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 768px) 30vw, 20vw"
                      className="object-contain object-bottom"
                    />
                  </div>
                  <p className="caption-copy mt-3 text-cream/70">
                    {item.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeader
              eyebrow="Projets"
              title={"Un tremplin vers la\u00a0production"}
              align="left"
              className="mb-6"
            />
            <div className="body-copy space-y-4">
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
        <div className="container-page">
          <SectionHeader
            eyebrow="Newsletter"
            title="Les prochaines sessions"
            align="left"
            description="Sois informé·e des dates et des ouvertures de nos formations."
          />
          <div className="max-w-xl">
            <NewsletterForm />
          </div>
        </div>
      </Section>

      <CtaFinal site={site} />
      <StickyCta />
    </>
  );
}
