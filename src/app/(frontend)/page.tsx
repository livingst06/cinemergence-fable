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
    title: "Stage Bande Démo Cinéma Paris — Cinémergence",
    description: site.description,
    alternates: { canonical: "/" },
  };
}

const equipeTechnique = [
  "Réalisateur",
  "1er assistant",
  "Chef opérateur",
  "Ingénieur son",
  "Maquilleuse",
  "Monteur",
  "Étalonneur",
  "Mixeur",
];

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
  const autres = formations.filter((f) => !f.prioritaire);
  const stagePrincipal = formations.find((f) => f.slug === "formation-jouer-face-camera");

  return (
    <>
      <section className="cinematic-grain hero-slash relative min-h-[85vh] overflow-hidden bg-noir md:min-h-[90vh]">
        <HeroVideoBackground />
        <div className="container-page relative z-10 flex min-h-[85vh] flex-col justify-center py-20 md:min-h-[90vh] md:py-28 lg:py-32">
          <div className="max-w-3xl">
            <p className="eyebrow animate-fade-up">Stage Bande Démo · Paris</p>
            <h1 className="display-title mt-6 animate-fade-up-delay-1 text-cream">
              Le meilleur stage
              <br />
              de France
            </h1>
            <p className="mt-4 animate-fade-up-delay-1 text-xl font-heading uppercase tracking-wide text-tungsten md:text-2xl">
              Qui te fait rencontrer de vrais talents du cinéma
            </p>
            <p className="mt-6 max-w-2xl animate-fade-up-delay-2 text-base leading-relaxed text-cream/85 md:text-lg">
              {site.tagline} Week-ends de tournage encadrés comme de vrais plateaux,
              avec une équipe complète et des intervenants d&apos;exception.
            </p>
            <div className="mt-10 flex animate-fade-up-delay-3 flex-col gap-4 sm:flex-row">
              <ButtonLink href="/contact" size="lg" className="btn-cta px-10">
                Inscription
              </ButtonLink>
              <ButtonLink
                href="#formation"
                size="lg"
                className="btn-outline-warm rounded-lg px-10 py-2.5 text-sm font-semibold uppercase tracking-wider"
              >
                Voir la formation
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
              eyebrow="À propos"
              title="Le cinéma n'attend pas, et toi non plus"
              align="left"
            />
            <div className="mt-8 space-y-4 text-muted-text">
              <p>
                Nous sommes une équipe de professionnels du cinéma réunis autour d&apos;une même
                idée : rendre la qualité de tournage accessible à tous les comédiens, même ceux
                qui débutent.
              </p>
              <p>
                Notre expérience dans la réalisation, la direction d&apos;acteur et la production
                nous permet de proposer des week-ends de tournage encadrés comme de vrais plateaux.
              </p>
              <p>
                Le stage Bande Démo Cinéma a été conçu pour offrir à chaque participant une
                expérience concrète, formatrice et valorisante, tout en respectant les standards
                du cinéma professionnel.
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
                qui nous anime, qui fait que nous n&apos;abandonnons pas. C&apos;est ce mot qui
                nous pousse à passer à l&apos;action.
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
              description="Des week-ends de tournage encadrés comme de vrais plateaux — master classes, répétitions et prises en conditions pro."
            />
            <PlateauCarousel slides={carouselPhotos} />
          </div>
        </Section>
      )}

      <Section id="formation">
        <div className="container-page">
          <SectionHeader
            eyebrow="La formation"
            title="Déroulement du stage"
            description="Deux jours intensifs — de la répétition au tournage professionnel."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="card-stage h-full p-8">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-or-light">
                  Jour 1
                </span>
                <h3 className="mt-3 font-heading text-2xl text-cream">
                  Répétitions et direction d&apos;acteur
                </h3>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-text">
                  <p>
                    Cette première journée est consacrée à la préparation artistique. Masterclass
                    de 2h avec le parrain de l&apos;édition en cours : échanges sur sa carrière,
                    atelier d&apos;acting sur le texte, l&apos;émotion et la justesse du jeu.
                  </p>
                  <p>
                    Les comédiens arrivent avec leurs scènes préalablement apprises, travaillent
                    leurs intentions et leur présence face caméra. La journée se termine par un
                    brief technique.
                  </p>
                  <p className="font-medium text-cream">
                    Objectif : entrer dans le rôle, comprendre la scène, se préparer.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="card-stage h-full p-8">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-or-light">
                  Jour 2
                </span>
                <h3 className="mt-3 font-heading text-2xl text-cream">Tournage professionnel</h3>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-text">
                  <p>
                    Place à l&apos;action. Chaque comédien tourne deux scènes dans des décors
                    réels : appartement, café, salle de sport, véhicule, gymnase…
                  </p>
                  <p>
                    L&apos;équipe technique complète (réalisateur, chef opérateur, 1er assistant,
                    maquilleuse) encadre chaque prise pour garantir un rendu cinéma.
                  </p>
                  <p className="font-medium text-cream">
                    Objectif : vivre un vrai tournage et repartir avec des scènes montées, prêtes
                    pour ta bande démo.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
          {stagePrincipal && (
            <div className="mt-10 text-center">
              <ButtonLink href={`/${stagePrincipal.slug}`} className="btn-cta">
                Voir le programme complet
              </ButtonLink>
            </div>
          )}
        </div>
      </Section>

      <Section>
        <div className="container-page">
          <SectionHeader
            eyebrow="Nos offres"
            title="Stage complet et bande démo"
            description="Paiement en 4x sans frais."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="card-stage p-8 text-center">
                <p className="font-heading text-6xl text-tungsten md:text-7xl">600 €</p>
                <p className="mt-4 text-muted-text">Pour le stage complet et la bande démo</p>
                <ButtonLink href="/contact" className="btn-cta mt-8">
                  Je m&apos;inscris
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="card-stage p-8 text-center">
                <p className="font-heading text-6xl text-tungsten md:text-7xl">750 €</p>
                <p className="mt-4 text-muted-text">
                  Stage complet et bande démo
                  <br />
                  <span className="text-sm">
                    + shooting photobook professionnel (4 portraits et 2 plein pieds)
                  </span>
                </p>
                <ButtonLink href="/contact" className="btn-cta mt-8">
                  Je m&apos;inscris
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section variant="secondary">
        <div className="container-page">
          <SectionHeader
            eyebrow="L'équipe"
            title="Une équipe de tournage complète"
            description="Elle est composée de :"
          />
          <ul className="flex flex-wrap justify-center gap-3">
            {equipeTechnique.map((role) => (
              <li
                key={role}
                className="rounded-full border border-white/10 bg-noir-secondary/80 px-4 py-2 text-sm text-cream/80"
              >
                {role}
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
            description="Le stage Bande Démo Cinéma au cœur de notre offre — et d'autres parcours pour aller plus loin."
          />
          <div className="catalogue-scroll -mx-5 flex gap-5 overflow-x-auto px-5 pb-4 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0">
            {prioritaires.map((f) => (
              <div key={f.slug} className="min-w-[88vw] shrink-0 snap-center md:min-w-0">
                <FormationCard formation={f} featured />
              </div>
            ))}
          </div>
          {autres.length > 0 && (
            <div className="catalogue-scroll mt-6 -mx-5 flex gap-5 overflow-x-auto px-5 pb-4 snap-x snap-mandatory lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0">
              {autres.map((f) => (
                <div key={f.slug} className="min-w-[72vw] shrink-0 snap-center sm:min-w-[45vw] lg:min-w-0">
                  <FormationCard formation={f} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section>
        <div className="container-page">
          <SectionHeader
            eyebrow="Intervenants"
            title="Nos intervenants d'exception"
            description="Des acteurs reconnus qui transmettent leur exigence sur le plateau."
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
                pas les bons outils pour te montrer. J&apos;ai imaginé ces stages pour changer
                ça !
              </p>
              <p className="mt-4 text-base leading-relaxed text-cream/90 md:text-lg">
                Offrir à chaque comédien(ne) un cadre pro, du matériel cinéma, une direction
                exigeante et surtout un résultat concret : deux scènes tournées, comme si elles
                étaient extraites d&apos;un film, prêtes à être envoyées à un agent ou à un
                directeur de casting.
              </p>
              <p className="mt-4 text-base leading-relaxed text-cream/90 md:text-lg">
                Mon objectif est de donner une vraie chance à chacun. C&apos;est pour ça que
                j&apos;ai voulu un format intensif, abordable, et encadré par une équipe tournage
                complète. Parce qu&apos;aujourd&apos;hui, ce qui compte, c&apos;est ce que tu
                montres à l&apos;écran. &rdquo;
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
              title="Matériel"
              align="left"
              className="mb-6"
            />
            <div className="space-y-4 text-sm leading-relaxed text-muted-text">
              <p>
                Nous tournons uniquement avec des caméras RED ou ARRI. C&apos;est le standard du
                cinéma et des plateformes : la majorité des films et séries actuels utilisent ces
                caméras.
              </p>
              <p>
                Tu travailles avec le même type de matériel que celui présent sur les plateaux
                professionnels. Objectif : te fournir une image conforme aux exigences du marché,
                exploitable par agents, directeurs de casting et productions.
              </p>
              <p className="font-medium text-cream">
                Ici, tu vis une vraie expérience plateau, avec des outils sérieux. Rien
                d&apos;approximatif.
              </p>
            </div>
          </div>
          <div>
            <SectionHeader eyebrow="Making-of" title="Contenu réseaux" align="left" className="mb-6" />
            <div className="space-y-4 text-sm leading-relaxed text-muted-text">
              <p>
                Pendant le stage, un vidéaste-photographe dédié couvre tout le plateau et te crée
                du contenu pour tes réseaux sociaux : montrer ton travail, ta progression, et ta
                présence sur un vrai plateau.
              </p>
              <p className="font-medium text-cream">
                Pas juste une bande-démo : tu montres ton travail, ton sérieux et ta progression.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-page">
          <SectionHeader
            eyebrow="Projets à venir"
            title="Un tremplin vers la production"
          />
          <div className="mx-auto max-w-3xl space-y-4 text-sm leading-relaxed text-muted-text">
            <p>
              Notre ambition ne s&apos;arrête pas à la création de bandes démo. L&apos;objectif à
              long terme est de construire un véritable tremplin pour les comédiens, un espace où
              formation, tournage et création se rejoignent.
            </p>
            <p>
              Tous les six mois, nous lancerons un appel à projets afin de produire un
              court-métrage réunissant les talents issus de nos stages. Les projets retenus seront
              produits par Bakelite Films, notre société de production.
            </p>
            <p>
              L&apos;objectif est clair : créer un lien durable entre la formation et la
              production, offrir une vraie continuité artistique, et donner une chance aux jeunes
              talents d&apos;être vus, reconnus et projetés sur grand écran.
            </p>
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
            description="Sois informé·e des dates du stage Bande Démo Cinéma."
          />
          <NewsletterForm />
        </div>
      </Section>

      <CtaFinal site={site} />
    </>
  );
}
