import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section, SectionHeader } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { getSiteSettings } from "@/lib/data";

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
        eyebrow="Qui sommes-nous ?"
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
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="Notre mission"
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
                nourrit des parcours concrets — chacun avec un livrable pour le stagiaire.
              </p>
              <p>
                Organisme de formation déclaré (NDA {site.nda}), nous accompagnons aussi le
                financement des formations (AFDAS, OPCO, CPF, France Travail).
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
                <dd className="text-muted-text">{site.nda}</dd>
              </div>
              <div>
                <dt className="text-or-light">Qualiopi</dt>
                <dd className="text-muted-text">Organisme certifié Qualiopi</dd>
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
          <h2 className="section-title text-cream">Une question ?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-text">
            Écris-nous ou appelle-nous au {site.phone} — on te répond rapidement.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/formations" className="btn-cta">
              Je vois les formations
            </ButtonLink>
            <ButtonLink href="/contact" className="btn-outline-warm rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wider">
              Je vous contacte
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
