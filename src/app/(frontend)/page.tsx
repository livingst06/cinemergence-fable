import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { HeroVideoBackground } from "@/components/sections/HeroVideoBackground";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";
import { CtaFinal } from "@/features/home/CtaFinal";
import { CredibilityBar } from "@/features/home/CredibilityBar";
import { PlateauCarousel } from "@/features/home/PlateauCarousel";
import { StickyCta } from "@/features/home/StickyCta";
import { Temoignages } from "@/features/home/Temoignages";
import { FinancementSection } from "@/features/financement/FinancementSection";
import { FormationCard } from "@/features/formations/FormationCard";
import { IntervenantCard } from "@/features/intervenants/IntervenantCard";
import { NewsletterForm } from "@/features/contact/NewsletterForm";
import {
  getCarouselMedia,
  getFinancementDispositifs,
  getFormations,
  getIntervenants,
  getSiteSettings,
  getTemoignages,
} from "@/lib/data";

export const revalidate = 300;

const heroPoints = [
  "Réalisateur primé",
  "Caméras RED / ARRI",
  "Invités & intervenants pro",
  "Livrables prêts pour castings",
];

const schoolBenefits = [
  "Conditions réelles de plateau",
  "Direction d'acteur & encadrement pro",
  "Matériel cinéma professionnel",
  "Livrable concret par formation",
  "Montage / post-prod selon parcours",
  "Finançable AFDAS · OPCO · CPF · France Travail",
];

const founderHighlights = [
  "Prix Orange Beaumarchais & Canal+ Talents",
  "Sacré Cœur — Grand Prix d'Oujda, Prix du public (New York Film Festival)",
  "Le Tombeau des Anges — prix à Los Angeles, Dubaï et Cannes",
  "Producteur avec Bakelite Films (dont Rose, Hassan Zahi)",
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
  const [site, formations, intervenants, temoignages, financement, carouselPhotos] =
    await Promise.all([
      getSiteSettings(),
      getFormations(),
      getIntervenants(),
      getTemoignages(),
      getFinancementDispositifs(),
      getCarouselMedia(),
    ]);

  const prioritaires = formations.filter((f) => f.prioritaire);
  const apercu = prioritaires.length > 0 ? prioritaires : formations.slice(0, 2);
  const autresApercu = formations.filter((f) => !apercu.some((p) => p.slug === f.slug)).slice(0, 4);

  return (
    <>
      <section className="cinematic-grain hero-slash relative min-h-[70vh] overflow-hidden bg-noir md:min-h-[75vh]">
        <HeroVideoBackground />
        <div className="container-page relative z-10 flex min-h-[70vh] flex-col justify-center py-16 md:min-h-[75vh] md:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow animate-fade-up">École de formation cinéma · Paris</p>
            <h1 className="display-title mt-6 animate-fade-up-delay-1 text-cream">
              Cinémergence
            </h1>
            <p className="mt-4 animate-fade-up-delay-1 text-xl font-heading uppercase tracking-wide text-tungsten md:text-2xl">
              Le cinéma, en conditions réelles.
            </p>
            <p className="mt-6 max-w-3xl animate-fade-up-delay-2 text-base leading-relaxed text-cream/85 md:text-lg">
              Une immersion totale sur de vrais&nbsp;plateaux
              <br />
              avec un livrable concret pour chaque&nbsp;parcours.
            </p>
            <ul className="mt-8 flex animate-fade-up-delay-2 flex-wrap gap-x-5 gap-y-2">
              {heroPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.14em] text-cream/80 md:text-[11px]"
                >
                  <span
                    className="h-1 w-1 shrink-0 rounded-full bg-projector shadow-[0_0_8px_var(--projector-glow)]"
                    aria-hidden
                  />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex animate-fade-up-delay-3 flex-col gap-4 sm:flex-row">
              <ButtonLink href="/formations" size="lg" className="btn-cta px-10">
                Les formations
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

      <CredibilityBar site={site} />

      {carouselPhotos.length > 0 && (
        <Section id="plateau">
          <div className="container-page">
            <SectionHeader
              eyebrow="Résultats"
              title="Sur le plateau"
              description={
                <>
                  <p>Répétitions, tournages et mises en situation filmées</p>
                  <p className="mt-1">ce que tu vis avant d&apos;expliquer le reste.</p>
                </>
              }
            />
            <PlateauCarousel slides={carouselPhotos} />
          </div>
        </Section>
      )}

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
                <p className="mt-1">chacun avec un livrable clair pour le&nbsp;stagiaire.</p>
              </>
            }
          />
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {[...apercu, ...autresApercu].map((f) => (
              <FormationCard key={f.slug} formation={f} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink href="/formations" className="btn-cta">
              Je vois toutes les formations
            </ButtonLink>
          </div>
        </div>
      </Section>

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
          <div className="mt-10 text-center">
            <ButtonLink
              variant="outline"
              href="/intervenants"
              className="btn-outline-warm rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wider"
            >
              Je vois toutes les fiches
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-page grid gap-12 lg:grid-cols-5 lg:items-center">
          <Reveal className="lg:col-span-2">
            <MediaFrame
              src={site.founderPhotoUrl}
              mimeType={site.founderPhotoMimeType}
              alt="Choukri Rouha sur le plateau de tournage"
              aspect="portrait"
              className="card-stage overflow-hidden rounded-lg border border-white/[0.06]"
            />
          </Reveal>
          <div className="space-y-8 lg:col-span-3">
            <SectionHeader
              eyebrow="Fondateur"
              title="Choukri Rouha"
              description="Réalisateur & fondateur de Cinémergence"
              align="left"
            />
            <p className="text-sm leading-relaxed text-muted-text">
              Formé au Cours Florent, Choukri Rouha débute comme acteur, puis s&apos;impose à
              l&apos;écriture et à la réalisation. Il a fondé Cinémergence pour offrir un cadre
              pro, du matériel cinéma et un résultat concret à chaque stagiaire.
            </p>
            <ul className="space-y-3">
              {founderHighlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-cream/90">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-or shadow-[0_0_6px_var(--or-glow)]"
                    aria-hidden
                  />
                  <p className="min-w-0 flex-1 text-justify leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-page">
          <SectionHeader eyebrow="Pourquoi Cinémergence ?" title="Le mot du fondateur" />
          <Reveal>
            <blockquote className="card-stage mx-auto max-w-4xl p-8 md:p-12">
              <p className="text-base leading-relaxed text-cream/90 md:text-lg">
                &ldquo; J&apos;ai commencé comme beaucoup : sans contact, sans moyens, juste avec
                l&apos;envie de jouer et d&apos;apprendre. À l&apos;époque, faire une bande démo
                coûtait une fortune, et rares étaient ceux qui pouvaient se payer un vrai
                tournage.
              </p>
              <p className="mt-4 text-base leading-relaxed text-cream/90 md:text-lg">
                Mon expérience m&apos;a appris que le talent seul ne suffit pas si tu n&apos;as
                pas les bons outils pour te montrer. J&apos;ai imaginé cette école de formation
                pour changer ça.
              </p>
              <p className="mt-4 text-base leading-relaxed text-cream/90 md:text-lg">
                Offrir à chaque stagiaire un cadre pro, du matériel cinéma, une direction
                exigeante et surtout un résultat concret — des images et des compétences
                exploitables.
              </p>
              <p className="mt-4 text-base leading-relaxed text-cream/90 md:text-lg">
                Mon objectif est de donner une vraie chance à chacun. Parce
                qu&apos;aujourd&apos;hui, ce qui compte, c&apos;est ce que tu montres à
                l&apos;écran. &rdquo;
              </p>
              <footer className="mt-8 text-sm font-semibold text-or-light">
                — Choukri Rouha, fondateur
              </footer>
            </blockquote>
          </Reveal>
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
