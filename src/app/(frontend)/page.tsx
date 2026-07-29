import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { HeroVideoBackground } from "@/components/sections/HeroVideoBackground";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";
import { CtaFinal } from "@/features/home/CtaFinal";
import { CredibilityBar } from "@/features/home/CredibilityBar";
import { PlateauCarousel } from "@/features/home/PlateauCarousel";
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
      <section className="cinematic-grain hero-slash relative min-h-[85vh] overflow-hidden bg-noir md:min-h-[90vh]">
        <HeroVideoBackground />
        <div className="container-page relative z-10 flex min-h-[85vh] flex-col justify-center py-20 md:min-h-[90vh] md:py-28 lg:py-32">
          <div className="max-w-3xl">
            <p className="eyebrow animate-fade-up">École de formation cinéma · Paris</p>
            <h1 className="display-title mt-6 animate-fade-up-delay-1 text-cream">
              Cinémergence
            </h1>
            <p className="mt-4 animate-fade-up-delay-1 text-xl font-heading uppercase tracking-wide text-tungsten md:text-2xl">
              Forme-toi sur de vrais plateaux
            </p>
            <p className="mt-6 max-w-2xl animate-fade-up-delay-2 text-base leading-relaxed text-cream/85 md:text-lg">
              {site.tagline} Des parcours concrets pour comédiens, techniciens et
              professionnels — encadrés comme le cinéma les exige.
            </p>
            <div className="mt-10 flex animate-fade-up-delay-3 flex-col gap-4 sm:flex-row">
              <ButtonLink href="/formations" size="lg" className="btn-cta px-10">
                Voir les formations
              </ButtonLink>
              <ButtonLink
                href="/financement"
                size="lg"
                className="btn-outline-warm rounded-lg px-10 py-2.5 text-sm font-semibold uppercase tracking-wider"
              >
                Financer ma formation
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <CredibilityBar site={site} />

      <Section id="apropos">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="L'école"
              title="Une école de formation cinéma"
              align="left"
            />
            <div className="mt-8 space-y-4 text-muted-text">
              <p>
                Cinémergence réunit des professionnels du cinéma autour d&apos;une idée claire :
                former en conditions réelles de plateau, avec le même niveau d&apos;exigence que
                sur un tournage.
              </p>
              <p>
                Notre catalogue s&apos;adresse aux comédiens, aux techniciens et aux entreprises
                qui veulent gagner en présence, en technique ou en employabilité — avec un
                livrable concret à chaque formation.
              </p>
              <p>
                Association loi 1901 et organisme de formation déclaré (NDA {site.nda}), nous
                accompagnons aussi le financement (AFDAS, OPCO, CPF, France Travail).
              </p>
            </div>
          </div>
          <Reveal>
            <blockquote className="card-stage flex h-full flex-col justify-center p-8 md:p-10">
              <p className="font-heading text-3xl leading-snug text-cream md:text-4xl">
                &ldquo; Action ! &rdquo;
              </p>
              <p className="mt-6 text-base leading-relaxed text-muted-text">
                C&apos;est ce que dit le réalisateur avant chaque prise. C&apos;est aussi ce mot
                qui nous anime : passer à l&apos;action, se former, se montrer.
              </p>
            </blockquote>
          </Reveal>
        </div>
      </Section>

      {carouselPhotos.length > 0 && (
        <Section variant="secondary" id="plateau">
          <div className="container-page">
            <SectionHeader
              eyebrow="Immersion"
              title="Sur le plateau"
              description="Répétitions, tournages et mises en situation filmées — le quotidien de nos formations."
            />
            <PlateauCarousel slides={carouselPhotos} />
          </div>
        </Section>
      )}

      <Section id="formations">
        <div className="container-page">
          <SectionHeader
            eyebrow="Catalogue"
            title="Nos formations"
            description="Des parcours professionnalisants, chacun avec un livrable clair pour le stagiaire."
          />
          <div className="catalogue-scroll -mx-5 flex gap-5 overflow-x-auto px-5 pb-4 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0">
            {apercu.map((f) => (
              <div key={f.slug} className="min-w-[88vw] shrink-0 snap-center md:min-w-0">
                <FormationCard formation={f} featured />
              </div>
            ))}
          </div>
          {autresApercu.length > 0 && (
            <div className="catalogue-scroll mt-6 -mx-5 flex gap-5 overflow-x-auto px-5 pb-4 snap-x snap-mandatory lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0">
              {autresApercu.map((f) => (
                <div
                  key={f.slug}
                  className="min-w-[72vw] shrink-0 snap-center sm:min-w-[45vw] lg:min-w-0"
                >
                  <FormationCard formation={f} />
                </div>
              ))}
            </div>
          )}
          <div className="mt-10 text-center">
            <ButtonLink href="/formations" className="btn-cta">
              Voir toutes les formations
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {intervenants.map((i) => (
              <IntervenantCard key={i.slug} intervenant={i} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink
              variant="outline"
              href="/intervenants"
              className="btn-outline-warm rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wider"
            >
              Voir toutes les fiches
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section variant="dark">
        <div className="container-page grid gap-12 lg:grid-cols-5 lg:items-start">
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
            <div className="space-y-4 text-sm leading-relaxed text-muted-text">
              <p>
                Formé au Cours Florent, Choukri Rouha débute comme acteur dans plusieurs films et
                séries. Il se consacre ensuite à l&apos;écriture, où il remporte plusieurs
                distinctions, dont le prix Orange Beaumarchais et Canal + Talents.
              </p>
              <p>
                Réalisateur de spots publicitaires et de clips, il s&apos;impose aussi comme
                producteur avec Sacré Cœur, récompensé par le Grand Prix d&apos;Oujda, le Prix du
                public au New York Film Festival et Fast Love en tant que réalisateur.
              </p>
              <p>
                Ses dernières réalisations : Le Tombeau des Anges, avec Karina Testa, Catherine Bad,
                Daniel Njo Lobé et Mathéo Capelli, a remporté plusieurs prix à Los Angeles, Dubaï et
                Cannes. Il a également produit Rose, réalisé par Hassan Zahi, en parcours
                international en festivals.
              </p>
            </div>
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

      <Section variant="secondary">
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
              title="Un tremplin vers la production"
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

      <Section variant="secondary">
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
    </>
  );
}
