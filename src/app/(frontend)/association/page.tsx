import type { Metadata } from "next";
import { QualiopiMark } from "@/components/brand/QualiopiMark";
import { NdaNumber } from "@/components/NdaNumber";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { getSiteSettings } from "@/lib/data";

const founderHighlights = [
  "Prix Orange Beaumarchais & Canal+ Talents",
  "Sacré Cœur — Grand Prix d'Oujda, Prix du public (New York Film Festival)",
  "Le Tombeau des Anges — prix à Los Angeles, Dubaï et Cannes",
  "Producteur avec Bakelite Films (dont Rose, Hassan Zahi)",
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Qui sommes-nous ? — Cinémergence",
    description:
      "Cinémergence, école de formation cinéma à Paris. Organisme de formation déclaré et certifié Qualiopi.",
    alternates: { canonical: "/association" },
  };
}

export default async function AssociationPage() {
  const site = await getSiteSettings();

  return (
    <>
      <PageHero
        title="École de formation cinéma"
        description={
          <>
            <p>
              Une équipe de professionnels réunis pour former en conditions réelles de
              plateau
            </p>
            <p className="mt-1">comédiens, techniciens et&nbsp;entreprises.</p>
          </>
        }
      />
      <Section>
        <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
          <Reveal>
            <div className="space-y-8">
              <MediaFrame
                src={site.founderPhotoUrl}
                mimeType={site.founderPhotoMimeType}
                alt="Choukri Rouha sur le plateau de tournage"
                aspect="portrait"
                sizes="(max-width: 1024px) 100vw, 28rem"
                className="card-stage max-w-md overflow-hidden rounded-lg border border-white/[0.06]"
              />
              <div className="space-y-6">
                <SectionHeader
                  title="Choukri Rouha"
                  description="Réalisateur & fondateur de Cinémergence"
                  align="left"
                  className="mb-0"
                />
                <p className="text-sm leading-relaxed text-muted-text">
                  Formé au Cours Florent, Choukri Rouha débute comme acteur, puis s&apos;impose à
                  l&apos;écriture et à la réalisation. Il a fondé Cinémergence pour offrir un cadre
                  pro, du matériel cinéma et un résultat concret à chaque élève.
                </p>
                <ul className="space-y-3">
                  {founderHighlights.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-cream/90">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-or shadow-[0_0_6px_var(--or-glow)]"
                        aria-hidden
                      />
                      <p className="min-w-0 flex-1 text-left md:text-justify leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <SectionHeader
              title="Le mot du fondateur"
              align="left"
              className="mb-8"
            />
            <blockquote className="card-stage p-6 md:p-8">
              <p className="text-sm leading-relaxed text-cream/90 md:text-base">
                &ldquo; J&apos;ai commencé comme beaucoup : sans contact, sans moyens, juste avec
                l&apos;envie de jouer et d&apos;apprendre. À l&apos;époque, faire une bande démo
                coûtait une fortune, et rares étaient ceux qui pouvaient se payer un vrai
                tournage.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-cream/90 md:text-base">
                Mon expérience m&apos;a appris que le talent seul ne suffit pas si tu n&apos;as
                pas les bons outils pour te montrer. J&apos;ai imaginé cette école de formation
                pour changer ça.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-cream/90 md:text-base">
                Offrir à chaque élève un cadre pro, du matériel cinéma, une direction
                exigeante et surtout un résultat concret — des images et des compétences
                exploitables.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-cream/90 md:text-base">
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
          <article className="mt-16 border-t border-white/[0.06] pt-16 lg:mt-24 lg:pt-24">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-16">
              <Reveal>
                <MediaFrame
                  src="/images/founder/gregory-verdat.jpg"
                  alt="Grégory Verdat au Cannes World Film Festival, avec la Luciole d'or"
                  aspect="portrait"
                  sizes="(max-width: 1024px) 100vw, 22rem"
                  className="card-stage max-w-md overflow-hidden rounded-lg border border-white/[0.06]"
                />
              </Reveal>
              <Reveal>
                <div className="space-y-6">
                  <SectionHeader
                    title="Grégory Verdat"
                    description="Vice-président de Cinémergence, fondateur et président de Bakélite Films, scénariste"
                    align="left"
                    className="mb-0"
                  />
                  <div className="space-y-4 text-sm leading-relaxed text-muted-text">
                    <p>
                      Grégory Verdat conjugue son engagement associatif avec un parcours dans
                      l&apos;écriture et la production cinématographique.
                    </p>
                    <p>
                      Après des collaborations avec le réalisateur Maxwell A. Cadevall sur{" "}
                      <span className="text-cream/90">Cœur de femme</span>,{" "}
                      <span className="text-cream/90">Jeu de couples</span> et{" "}
                      <span className="text-cream/90">Jeu de dames</span>, il cofonde Bakélite
                      Films avec Choukri Rouha et en assure la présidence. Il accompagne les
                      projets, de leur développement artistique jusqu&apos;à l&apos;écran.
                    </p>
                    <p>
                      Scénariste et producteur de{" "}
                      <span className="text-cream/90">MOTHERS (Le Tombeau des Anges)</span>, il en
                      assure également la coordination de production. Sélectionné et projeté au
                      prestigieux Chinese Theatre du Beverly Hills Film Festival, le film remporte la
                      Luciole d&apos;or, prix du meilleur court-métrage de fiction au Cannes World
                      Film Festival en 2025, ainsi que des prix du scénario au Festival
                      international maghrébin du film d&apos;Oujda.
                    </p>
                    <p>
                      Sa collaboration avec Choukri Rouha se poursuit avec la coécriture de deux
                      longs-métrages&nbsp;: <span className="text-cream/90">Les Cordes</span>,
                      autour de la boxe et de la résilience, et{" "}
                      <span className="text-cream/90">Ne m&apos;oublie pas</span>, consacré à la
                      maladie d&apos;Alzheimer. Ces projets prolongent son engagement dans
                      l&apos;écriture et le développement de récits ancrés dans des enjeux humains
                      et sociaux.
                    </p>
                    <p>
                      Membre actif de la CST, il inscrit son engagement cinématographique au
                      croisement de la création, des métiers techniques et des exigences de
                      production.
                    </p>
                    <p>
                      En parallèle de son parcours artistique, il évolue dans le secteur du
                      numérique, où il a développé une longue expérience en business
                      développement, gestion de partenariats stratégiques et de maîtrise des
                      technologies. Cette double culture nourrit son approche du cinéma, associant
                      créativité, compréhension des outils et structuration des projets.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </article>
        </div>
      </Section>
      <Section>
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              title="Former comme on tourne"
              align="left"
              className="mb-8"
            />
            <div className="space-y-4 text-muted-text">
              <p>
                Cinémergence est une école de formation cinéma à Paris. Nous réunissons des
                professionnels du cinéma autour d&apos;une idée claire : former en conditions
                réelles de plateau, avec le même niveau d&apos;exigence que sur un tournage.
              </p>
              <p>
                Notre expérience dans la réalisation, la direction d&apos;acteur et la production
                nourrit des parcours concrets — chacun avec un livrable pour l'élève.
              </p>
              <p>
                Organisme de formation déclaré (NDA <NdaNumber nda={site.nda} />).
              </p>
            </div>
          </div>
          <div className="card-stage p-8">
            <h3 className="font-heading text-2xl text-cream">Informations légales</h3>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-or-light">Statut</dt>
                <dd className="text-muted-text">{site.legalName}</dd>
              </div>
              <div>
                <dt className="text-or-light">Localisation</dt>
                <dd className="text-muted-text">{site.city}</dd>
              </div>
              <div>
                <dt className="text-or-light">NDA</dt>
                <dd className="text-muted-text">
                  <NdaNumber nda={site.nda} />
                </dd>
              </div>
              <div>
                <dt className="text-or-light">
                  Organisme de formation certifié jusqu&apos;au 17 août 2029
                </dt>
                <dd className="mt-3">
                  <QualiopiMark size="sm" showTitle={false} />
                </dd>
              </div>
              <div>
                <dt className="text-or-light">Partenaire</dt>
                <dd className="text-muted-text">
                  {site.partnerRole} — {site.partnerName}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>
      <Section variant="secondary">
        <div className="container-page text-center">
          <h2 className="section-title">Une question ?</h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-muted-text">
            <span className="whitespace-nowrap">Écris-nous</span> ou{" "}
            <span className="whitespace-nowrap">appelle-nous au {site.phone}</span>
            {" "}— on te répond rapidement.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/contact" className="btn-cta">
              Je réserve ma place
            </ButtonLink>
            <ButtonLink href="/formations" className="btn-outline-warm rounded-lg px-6">
              Voir les formations
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
