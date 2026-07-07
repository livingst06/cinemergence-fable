import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Section, SectionHeader } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { IntervenantCard } from "@/features/intervenants/IntervenantCard";
import { getFormationBySlug, getFormations, getIntervenants, getSiteSettings } from "@/lib/data";
import { defaultFinancement } from "@/lib/defaults";
import { courseJsonLd } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const formations = await getFormations();
  return formations.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const formation = await getFormationBySlug(slug);
  if (!formation) return {};
  return {
    title: formation.metaTitle,
    description: formation.metaDescription,
    alternates: { canonical: `/${formation.slug}` },
  };
}

export default async function FormationPage({ params }: Props) {
  const { slug } = await params;
  const formation = await getFormationBySlug(slug);
  if (!formation) notFound();

  const [site, allIntervenants] = await Promise.all([
    getSiteSettings(),
    getIntervenants(),
  ]);

  const linkedIntervenants = allIntervenants.filter((i) =>
    formation.intervenants.includes(i.slug),
  );

  const financementLabels = defaultFinancement
    .filter((d) => formation.financements.includes(d.key))
    .map((d) => d.titre);

  const jsonLd = courseJsonLd(formation, site);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        eyebrow={formation.pole}
        title={formation.titre}
        description={formation.accroche}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          {formation.prioritaire && (
            <Badge className="bg-projector text-cream">Formation prioritaire</Badge>
          )}
          <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-or-light">
            Livrable : {formation.livrable}
          </Badge>
        </div>
        <div className="mt-8">
          <ButtonLink
            href={`/contact?formation=${formation.slug}`}
            size="lg"
            className="btn-cta"
          >
            Je m&apos;inscris
          </ButtonLink>
        </div>
      </PageHero>

      <Section>
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="section-title text-cream">Pour qui ?</h2>
            <p className="mt-4 text-muted-text">{formation.pourQui}</p>
            <p className="mt-6 text-sm font-medium text-or-light">{formation.publicCible}</p>
            <p className="mt-8 leading-relaxed text-muted-text">{formation.intro}</p>
          </div>
          <MediaFrame
            src={formation.coverImageUrl}
            mimeType={formation.coverImageMimeType}
            alt={`Visuel plateau — ${formation.titreCourt}`}
            aspect="video"
            className={formation.prioritaire ? "gold-glow" : undefined}
          />
        </div>
      </Section>

      <Section variant="secondary">
        <div className="container-page">
          <SectionHeader eyebrow="Programme" title="Ce que tu vas apprendre" />
          <div className="grid gap-4 md:grid-cols-2">
            {formation.programme.map((module, i) => (
              <div
                key={module.titre}
                className="card-stage p-6"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-or-light">
                  Module {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-heading text-xl text-cream">{module.titre}</h3>
                <p className="mt-2 text-sm text-muted-text">{module.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-page">
          <SectionHeader eyebrow="Objectifs" title="En sortie, tu sauras" />
          <ul className="grid gap-3 md:grid-cols-2">
            {formation.objectifs.map((obj) => (
              <li
                key={obj}
                className="card-stage flex items-start gap-3 p-4 text-sm text-cream/90"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-projector shadow-[0_0_6px_var(--projector-glow)]" />
                {obj}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section variant="secondary">
        <div className="container-page grid gap-8 md:grid-cols-3">
          <div className="card-stage p-6">
            <p className="eyebrow">Durée</p>
            <p className="mt-2 font-heading text-2xl text-cream">{formation.duree}</p>
          </div>
          <div className="card-stage p-6">
            <p className="eyebrow">Format</p>
            <p className="mt-2 font-heading text-2xl text-cream">{formation.format}</p>
          </div>
          <div className="card-stage p-6">
            <p className="eyebrow">Tarif</p>
            <p className="mt-2 font-heading text-2xl text-cream">
              {formation.tarif ?? "À confirmer"}
            </p>
          </div>
        </div>
        {financementLabels.length > 0 && (
          <div className="container-page mt-8">
            <p className="text-sm text-muted-text">
              Financements éligibles :{" "}
              <span className="text-or-light">{financementLabels.join(" · ")}</span>
            </p>
          </div>
        )}
      </Section>

      {linkedIntervenants.length > 0 && (
        <Section>
          <div className="container-page">
            <SectionHeader eyebrow="Intervenants" title="Encadré par" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {linkedIntervenants.map((i) => (
                <IntervenantCard key={i.slug} intervenant={i} />
              ))}
            </div>
          </div>
        </Section>
      )}

      {formation.faq.length > 0 && (
        <Section variant="dark">
          <div className="container-page max-w-3xl">
            <SectionHeader eyebrow="FAQ" title="Questions fréquentes" align="left" />
            <Accordion className="w-full">
              {formation.faq.map((item, i) => (
                <AccordionItem key={item.q} value={`faq-${i}`} className="border-white/[0.06]">
                  <AccordionTrigger className="text-cream hover:text-or-light">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-text">{item.r}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>
      )}

      <Section>
        <div className="container-page text-center">
          <h2 className="section-title text-cream">Prêt à te lancer ?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-text">
            Contacte-nous pour t&apos;inscrire ou vérifier ton financement.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink
              href={`/contact?formation=${formation.slug}`}
              size="lg"
              className="btn-cta"
            >
              Je m&apos;inscris
            </ButtonLink>
            <ButtonLink
              href="/financement"
              className="btn-outline-warm rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wider"
            >
              Vérifier mon financement
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
