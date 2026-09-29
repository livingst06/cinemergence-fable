import { statSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { preload } from "react-dom";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { BrandSignature } from "@/components/brand/BrandSignature";
import { HeroVideoBackground } from "@/components/sections/HeroVideoBackground";
import { Section, SectionHeader } from "@/components/ui/Section";
import { CtaFinal } from "@/features/home/CtaFinal";
import { DaFilmstrip } from "@/features/home/DaFilmstrip";
import { HeroProofCard } from "@/features/home/HeroProofCard";
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

  const portraitIntervenants = intervenants.filter(
    (i) =>
      (i.categorie ?? "professionnel") === "professionnel" && i.slug !== "karina-testa",
  );

  return (
    <>
      <section className="cinematic-grain relative -mt-[calc(var(--site-notice-h)+var(--site-header-h)+env(safe-area-inset-top,0px))] flex min-h-[100svh] flex-col overflow-hidden bg-noir md:min-h-[calc(78vh+var(--site-notice-h)+var(--site-header-h)+env(safe-area-inset-top,0px))]">
        <HeroVideoBackground
          src={heroPublicAsset("hero-plateau-travel.mp4")}
          srcMobile={heroPublicAsset("hero-plateau-travel-mobile.mp4")}
          poster={heroPoster}
        />
        <div className="hero-slash-edge" aria-hidden />
        <div className="relative z-10 flex min-h-[100svh] flex-1 flex-col pt-[calc(var(--site-notice-h)+var(--site-header-h)+env(safe-area-inset-top,0px))] md:min-h-[calc(78vh+var(--site-notice-h)+var(--site-header-h)+env(safe-area-inset-top,0px))]">
          <div className="container-page flex flex-col items-start pt-3 md:pt-4">
            <p className="eyebrow animate-fade-up">
              Cinéma × Formation × Émergence
            </p>
            <h1 className="display-title da-rule mt-4 animate-fade-up-delay-1 text-cream">
              Cinémergence
            </h1>
            <p className="mt-3 animate-fade-up-delay-1 font-heading text-[11px] font-semibold uppercase leading-relaxed tracking-[0.22em] text-cream/80 md:text-xs">
              Des talents d&apos;aujourd&apos;hui aux cinéastes de demain
            </p>
            <div className="mt-8 flex flex-col items-start gap-5 md:flex-row md:items-start md:gap-3">
              <ul className="order-2 animate-fade-up-delay-2 space-y-2 text-base leading-relaxed text-cream/90 md:order-1 md:text-lg">
                {[
                  "Une immersion totale sur de vrais plateaux",
                  "Direction d'acteur et encadrement pro",
                  "Un livrable concret pour chaque parcours",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 md:gap-4">
                    <span className="h-1.5 w-1.5 shrink-0 bg-convert" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="order-1 shrink-0 overflow-visible pb-2 md:order-2 md:pb-0 md:pl-4">
                <BrandSignature className="animate-fade-up text-2xl text-white md:text-4xl lg:text-5xl" />
              </div>
            </div>
            <div className="mt-8 flex w-full animate-fade-up-delay-2 flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <ButtonLink href="/contact" size="lg" className="btn-cta min-h-12 w-full px-8 sm:w-auto sm:px-10">
                Je réserve ma place
              </ButtonLink>
              <ButtonLink
                href="/formations"
                size="lg"
                className="btn-outline-warm min-h-12 w-full rounded-none px-8 py-2.5 text-sm font-semibold uppercase tracking-wider sm:w-auto sm:px-10"
              >
                Voir les formations
              </ButtonLink>
            </div>
          </div>
          <div className="mt-auto w-full">
            <div className="container-page pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-10 md:pb-10">
              <div className="max-w-3xl animate-fade-up-delay-3">
                <HeroProofCard nda={site.nda} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <DaFilmstrip />

      <Section compact>
        <div className="container-page">
          <SectionHeader
            title="Les intervenants"
            align="left"
            description="Des professionnels en activité qui transmettent leur exigence sur le plateau."
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {portraitIntervenants.map((i) => (
              <IntervenantCard key={i.slug} compact intervenant={i} />
            ))}
          </div>
        </div>
      </Section>

      <Section compact id="formations">
        <div className="container-page">
          <SectionHeader
            title="Nos formations"
            align="left"
            description={
              <>
                <p>Des parcours professionnalisants,</p>
                <p className="mt-1">chacun avec un livrable clair pour l'élève.</p>
              </>
            }
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:gap-4">
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

      <Section compact>
        <div className="container-page space-y-8 md:space-y-10">
          <div>
            <SectionHeader
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
      <FinancementSection compact dispositifs={financement} />

      <Section compact>
        <div className="container-page">
          <SectionHeader
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
    </>
  );
}
