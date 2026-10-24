import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeader } from "@/components/ui/Section";
import {
  FormationLabeledGrid,
  FormationPedagogy,
  FormationProse,
} from "@/features/formations/FormationPedagogy";
import { FormationSessionGallery } from "@/features/formations/FormationSessionGallery";
import { IntervenantCard } from "@/features/intervenants/IntervenantCard";
import { getFormationBySlug, getFormations, getIntervenants, getSiteSettings } from "@/lib/data";
import { canonicalFormationSlug, formationPath } from "@/lib/defaults";
import { splitDuree } from "@/lib/formation-format";
import { courseJsonLd } from "@/lib/seo";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const formations = await getFormations();
  return formations
    .filter((f) => canonicalFormationSlug(f.slug) === f.slug && f.slug !== "kheiron")
    .map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = canonicalFormationSlug(raw);
  const formation = await getFormationBySlug(slug);
  if (!formation) return {};
  return {
    title: formation.metaTitle,
    description: formation.metaDescription,
    alternates: { canonical: formationPath(formation.slug) },
  };
}

export default async function FormationDetailPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = canonicalFormationSlug(raw);
  if (raw !== slug) redirect(formationPath(slug));
  const formation = await getFormationBySlug(slug);
  if (!formation) notFound();

  const [site, allIntervenants] = await Promise.all([
    getSiteSettings(),
    getIntervenants(),
  ]);

  const intervenantBySlug = new Map(allIntervenants.map((i) => [i.slug, i]));
  const linkedIntervenants = formation.intervenants
    .map((slug) => intervenantBySlug.get(slug))
    .filter((i): i is NonNullable<typeof i> => i != null && i.slug !== "karina-testa");

  const livrables =
    formation.livrables && formation.livrables.length > 0
      ? formation.livrables
      : [formation.livrable];

  const competences = formation.competences ?? [];
  const methodes = formation.methodesPedagogiques ?? [];
  const moyens = formation.moyensTechniques ?? [];
  const jsonLd = courseJsonLd(formation, site);
  const dureeParts = splitDuree(
    formation.duree,
    formation.dureeHeures,
    formation.dureeJours,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-page space-y-10 py-8 md:space-y-20 md:py-16 lg:py-20">
        <header className="max-w-4xl">
          <h1 className="display-title da-rule max-w-5xl">{formation.titre}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-text">
            {formation.sousTitre ?? formation.accroche}
          </p>
          <div className="mt-6 flex flex-col items-start gap-3">
            {formation.prioritaire && (
              <span className="rounded-full bg-projector px-3 py-1.5 text-sm font-bold text-cream">
                À la une
              </span>
            )}
            <div className="w-full max-w-2xl rounded-xl border border-or/25 bg-or/5 px-4 py-3">
              <p className="text-sm font-semibold text-or-light">
                Livrable
              </p>
              <ul className="mt-2 space-y-1.5 text-sm leading-snug text-or-light">
                {(formation.livrables && formation.livrables.length > 0
                  ? formation.livrables
                  : [formation.livrable]
                ).map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-projector" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {formation.modalite && (
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-cream/80">
                {formation.modalite}
              </span>
            )}
          </div>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <ButtonLink
              href={`/contact?formation=${formation.slug}`}
              size="lg"
              className="btn-cta"
            >
              Je m&apos;inscris
            </ButtonLink>
          </div>
        </header>

        <div>
          <div
            className={
              formation.effectifMax != null
                ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5"
                : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5"
            }
          >
            <div className="card-stage p-5 md:p-6">
              <p className="eyebrow">Durée</p>
              <p className="mt-2 text-left font-sans text-3xl text-cream">{dureeParts.title}</p>
              {dureeParts.subtitle && (
                <p className="mt-1 text-sm leading-relaxed text-muted-text">
                  {dureeParts.subtitle}
                </p>
              )}
            </div>
            <div className="card-stage p-5 md:p-6">
              <p className="eyebrow">Format</p>
              <p className="mt-2 text-left font-sans text-2xl text-cream">{formation.format}</p>
            </div>
            {formation.effectifMax != null && (
              <div className="card-stage p-5 md:p-6">
                <p className="eyebrow">Places</p>
                <p className="mt-2 text-left font-sans text-2xl text-cream">
                  {formation.effectifMax} places max par session
                </p>
              </div>
            )}
            <div className="card-stage p-5 md:p-6">
              <p className="eyebrow">Public</p>
              <p className="mt-2 text-sm leading-relaxed text-cream/90">{formation.publicCible}</p>
            </div>
          </div>
          <FormationSessionGallery slug={formation.slug} />
        </div>

        <div className="max-w-3xl">
          <h2 className="section-title da-rule">Pour qui ?</h2>
          <p className="mt-4 text-muted-text">{formation.pourQui}</p>
          {formation.prerequis && (
            <p className="mt-6 text-sm text-muted-text">
              <span className="font-semibold text-or-light">Prérequis — </span>
              {formation.prerequis}
            </p>
          )}
          {formation.lieu && (
            <p className="mt-3 text-sm text-muted-text">
              <span className="font-semibold text-or-light">Lieu — </span>
              {formation.lieu}
            </p>
          )}
        </div>

        <div className="max-w-3xl">
          <SectionHeader
            title="Ce que ça t'apporte"
            align="left"
            className="mb-6 md:mb-8"
          />
          <FormationProse>
            {(formation.contexteFinalite ?? formation.intro)
              .split(/\n\n+/)
              .filter(Boolean)
              .map((para) => (
                <p key={para.slice(0, 48)}>{para}</p>
              ))}
            {formation.contexteFinalite &&
              formation.intro &&
              !formation.contexteFinalite.includes(formation.intro) && (
                <p>{formation.intro}</p>
              )}
          </FormationProse>
        </div>

        <div>
          <SectionHeader
            title={"À l'issue, tu seras capable\u00a0de"}
            align="left"
            className="mb-8 md:mb-10"
          />
          <ul className="grid gap-3 md:grid-cols-2">
            {formation.objectifs.map((obj) => (
              <li
                key={obj}
                className="card-stage flex items-start gap-3 p-4 text-sm text-cream/90"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-projector shadow-[0_0_6px_var(--projector-glow)]" />
                <p className="min-w-0 flex-1 text-left md:text-justify leading-relaxed">{obj}</p>
              </li>
            ))}
          </ul>
        </div>

        {competences.length > 0 && (
          <div>
            <SectionHeader
              title="Ce que tu développes"
              align="left"
              className="mb-8 md:mb-10"
            />
            <FormationLabeledGrid items={competences} />
          </div>
        )}

        {formation.programme.length > 0 && (
        <div>
          <SectionHeader
            title="Déroulement de la formation"
            align="left"
            className="mb-8 md:mb-10"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {formation.programme.map((module, i) => (
              <article key={`${module.titre}-${i}`} className="card-stage flex flex-col p-6">
                <span className="text-sm font-semibold text-or-light">
                  {module.jour != null
                    ? `Jour ${String(module.jour).padStart(2, "0")}`
                    : `Module ${String(i + 1).padStart(2, "0")}`}
                </span>
                <h3 className="mt-2 font-heading text-xl text-cream">{module.titre}</h3>
                {module.objectifJournee && (
                  <p className="mt-2 text-sm font-medium text-or-light">{module.objectifJournee}</p>
                )}
                {module.detail && !module.sequences?.length && (
                  <p className="mt-2 text-sm text-muted-text">{module.detail}</p>
                )}
                {module.sequences && module.sequences.length > 0 && (
                  <ul className="mt-5 space-y-3 border-t border-white/[0.06] pt-4">
                    {module.sequences.map((seq) => (
                      <li key={seq.titre} className="flex items-start gap-3">
                        <span
                          className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-projector"
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium text-cream/90">{seq.titre}</p>
                            {seq.duree && (
                              <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-sm font-semibold text-muted-text">
                                {seq.duree}
                              </span>
                            )}
                          </div>
                          {seq.detail && (
                            <p className="mt-1 text-left md:text-justify text-xs leading-relaxed text-muted-text">
                              {seq.detail}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>
        )}

        <div>
          <SectionHeader
            title="Ce qui est inclus"
            align="left"
            className="mb-8 md:mb-10"
          />
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              formation.duree ? `Durée : ${formation.duree}` : null,
              formation.effectifMax != null
                ? `${formation.effectifMax} places max par session`
                : null,
              formation.format ? `Format : ${formation.format}` : null,
              formation.modalite ? `Modalité : ${formation.modalite}` : null,
              ...livrables.slice(0, 3).map((item) => `Livrable — ${item}`),
            ]
              .filter((item): item is string => Boolean(item))
              .slice(0, 8)
              .map((item) => (
                <li
                  key={item}
                  className="card-stage flex items-start gap-3 p-4 text-sm text-cream/90"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-projector shadow-[0_0_6px_var(--projector-glow)]" />
                  <p className="min-w-0 flex-1 text-left md:text-justify leading-relaxed">{item}</p>
                </li>
              ))}
          </ul>
        </div>

        <div>
          <SectionHeader title="Tu repars avec" align="left" className="mb-8 md:mb-10" />
          <ul className="grid gap-3 md:grid-cols-2">
            {livrables.map((item) => (
              <li
                key={item}
                className="card-stage flex items-start gap-3 p-4 text-sm text-cream/90"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-or shadow-[0_0_6px_var(--or-glow)]" />
                <p className="min-w-0 flex-1 text-left md:text-justify leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {(methodes.length > 0 || moyens.length > 0 || formation.encadrement) && (
          <FormationPedagogy
            methodes={methodes}
            moyens={moyens}
            encadrement={formation.encadrement}
          />
        )}

        {linkedIntervenants.length > 0 && (
          <div>
            <SectionHeader title="Encadré par" align="left" className="mb-8 md:mb-10" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {linkedIntervenants.map((i) => (
                <IntervenantCard key={i.slug} compact intervenant={i} />
              ))}
            </div>
          </div>
        )}

        {formation.faq.length > 0 && (
          <div className="max-w-3xl">
            <SectionHeader
              title="Questions fréquentes"
              align="left"
              className="mb-6 md:mb-8"
            />
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
        )}

        <div className="border-t border-white/[0.06] pt-12 text-center md:pt-16">
          <h2 className="section-title">Prêt à te lancer ?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-text">
            Contacte-nous pour t&apos;inscrire à cette formation.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink
              href={`/contact?formation=${formation.slug}`}
              size="lg"
              className="btn-cta"
            >
              Je m&apos;inscris
            </ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}
