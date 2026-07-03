import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section, SectionHeader } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { getSiteSettings } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "L'association Cinémergence — À propos",
    description:
      "Cinémergence, association loi 1901 à Paris. Stage Bande Démo Cinéma encadré comme un vrai plateau de tournage.",
    alternates: { canonical: "/association" },
  };
}

export default async function AssociationPage() {
  const site = await getSiteSettings();

  return (
    <>
      <PageHero
        eyebrow="À propos"
        title="Le cinéma n'attend pas, et toi non plus"
        description="Une équipe de professionnels du cinéma réunis pour rendre la qualité de tournage accessible à tous les comédiens."
      />
      <Section>
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="Notre mission"
              title="Rendre le plateau accessible"
              align="left"
              className="mb-8"
            />
            <div className="space-y-4 text-muted-text">
              <p>
                Nous sommes une équipe de professionnels du cinéma réunis autour d&apos;une même
                idée : rendre la qualité de tournage accessible à tous les comédiens, même ceux qui
                débutent.
              </p>
              <p>
                Notre expérience dans la réalisation, la direction d&apos;acteur et la production
                nous permet de proposer des week-ends de tournage encadrés comme de vrais plateaux.
              </p>
              <p>
                Le stage Bande Démo Cinéma a été conçu pour offrir à chaque participant une
                expérience concrète, formatrice et valorisante, tout en respectant les standards du
                cinéma professionnel.
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
                <dd className="text-muted-text">
                  {site.qualiopiObtained ? "Certifié Qualiopi" : site.qualiopiLabel}
                </dd>
              </div>
              <div>
                <dt className="text-or-light">Partenaire</dt>
                <dd className="text-muted-text">
                  {site.partnerRole} — {site.partnerName}
                </dd>
              </div>
            </dl>
            {!site.qualiopiObtained && (
              <div className="mt-6 rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-muted-text">
                Emplacement réservé — Logo Qualiopi (activation sans redéveloppement)
              </div>
            )}
          </div>
        </div>
      </Section>
      <Section variant="secondary">
        <div className="container-page text-center">
          <h2 className="section-title text-cream">Une question ?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-text">
            Écris-nous ou appelle-nous au {site.phone} — on te répond rapidement.
          </p>
          <ButtonLink href="/contact" className="mt-8 btn-cta">
            Nous contacter
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
