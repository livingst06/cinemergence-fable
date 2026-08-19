import type { Metadata } from "next";
import Link from "next/link";

import { Section, SectionHeader } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { ContactForm } from "@/features/contact/ContactForm";
import { getFormations, getSiteSettings } from "@/lib/data";

type Props = {
  searchParams: Promise<{ formation?: string; type?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: "Contact et inscription",
    description: `Contactez Cinémergence pour vous inscrire à une formation cinéma à Paris. ${site.email}`,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage({ searchParams }: Props) {
  const params = await searchParams;
  const formations = await getFormations();
  const site = await getSiteSettings();
  const defaultType =
    params.type === "financement" ? "financement" : ("inscription" as const);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Je me lance"
        description={
          <>
            <p>Une question, une inscription, un projet de financement&nbsp;?</p>
            <p className="mt-1">Écris-nous — on te répond rapidement.</p>
          </>
        }
      />
      <Section>
        <div className="container-page grid gap-12 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <SectionHeader
              eyebrow="Formulaire"
              title="Envoie ta demande"
              align="left"
              className="mb-8"
            />
            <ContactForm
              formations={formations.map((f) => ({
                slug: f.slug,
                titreCourt: f.titreCourt,
              }))}
              defaultFormation={params.formation}
              defaultType={defaultType}
            />
          </div>
          <aside className="xl:col-span-2 space-y-6">
            <div className="card-stage p-6">
              <h3 className="font-heading text-xl text-cream">Coordonnées</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-text">
                <li>
                  <span className="text-or-light">Email</span>
                  <br />
                  <a href={`mailto:${site.email}`} className="hover:text-cream">
                    {site.email}
                  </a>
                </li>
                <li>
                  <span className="text-or-light">WhatsApp / Téléphone</span>
                  <br />
                  <a
                    href={`https://wa.me/${site.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cream"
                  >
                    {site.phone}
                  </a>
                </li>
                <li>
                  <span className="text-or-light">Ville</span>
                  <br />
                  {site.city}
                </li>
                {site.instagramUrl && (
                  <li>
                    <span className="text-or-light">Instagram</span>
                    <br />
                    <a
                      href={site.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-cream"
                    >
                      @cinemergence
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div className="card-stage p-6">
              <h3 className="font-heading text-xl text-cream">Réassurance</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-text">
                <li>Inscription accompagnée · devis &amp; facture</li>
                <li>Organisme de formation déclaré · NDA {site.nda}</li>
                <li>
                  <Link href="/cgv" className="text-or-light hover:underline">
                    CGV &amp; politique d&apos;annulation
                  </Link>
                </li>
                <li>
                  <Link href="/confidentialite" className="text-or-light hover:underline">
                    Confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
