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
import { SectionHeader } from "@/components/ui/Section";
import { IntervenantCard } from "@/features/intervenants/IntervenantCard";
import { getFormationBySlug, getFormations, getIntervenants, getSiteSettings } from "@/lib/data";
import { defaultFinancement, formationLivrableLabel, formationPath } from "@/lib/defaults";
import { resolveFormationCoverUrl } from "@/lib/site-media";
import { courseJsonLd } from "@/lib/seo";

export const revalidate = 300;

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
    alternates: { canonical: formationPath(formation.slug) },
  };
}

export default async function FormationDetailPage({ params }: Props) {
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

  const livrables =
    formation.livrables && formation.livrables.length > 0
      ? formation.livrables
      : [formation.livrable];

  const competences = formation.competences ?? [];
  const methodes = formation.methodesPedagogiques ?? [];
  const moyens = formation.moyensTechniques ?? [];
  const jsonLd = courseJsonLd(formation, site);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-page space-y-16 py-12 md:space-y-20 md:py-16 lg:py-20">
        <header className="max-w-4xl">
          <p className="eyebrow mb-4">{formation.pole}</p>
          <h1 className="display-title text-cream">{formation.titre}</h1>
          <p className="mt-5 text-base leading-relaxed text-muted-text md:text-lg">
            {formation.sousTitre ?? formation.accroche}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {formation.prioritaire && (
              <Badge className="bg-projector text-cream">À la une</Badge>
            )}
            <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-or-light">
              Livrable : {formationLivrableLabel(formation)}
            </Badge>
            {formation.modalite && (
              <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-cream/80">
                {formation.modalite}
              </Badge>
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
            <ButtonLink
              href="/financement"
              size="lg"
              className="btn-outline-warm rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wider"
            >
              Financer ma formation
            </ButtonLink>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <div className="card-stage p-5 md:p-6">
            <p className="eyebrow">Durée</p>
            <p className="mt-2 font-heading text-2xl text-cream">{formation.duree}</p>
          </div>
          <div className="card-stage p-5 md:p-6">
            <p className="eyebrow">Format</p>
            <p className="mt-2 font-heading text-2xl text-cream">{formation.format}</p>
          </div>
          <div className="card-stage p-5 md:p-6">
            <p className="eyebrow">Tarif</p>
            <p className="mt-2 font-heading text-2xl text-cream">
              {formation.tarif ?? "À confirmer"}
            </p>
          </div>
          <div className="card-stage p-5 md:p-6">
            <p className="eyebrow">Public</p>
            <p className="mt-2 text-sm leading-relaxed text-cream/90">{formation.publicCible}</p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="section-title text-cream">Pour qui ?</h2>
            <p className="mt-4 text-muted-text">{formation.pourQui}</p>
            {formation.prerequis && (
              <p className="mt-6 text-sm text-muted-text">
                <span className="font-semibold text-or-light">Prérequis — </span>
                {formation.prerequis}
              </p>
            )}
            {formation.effectifMax != null && (
              <p className="mt-3 text-sm text-muted-text">
                <span className="font-semibold text-or-light">Places — </span>
                {formation.effectifMax} places max par session
              </p>
            )}
            {formation.lieu && (
              <p className="mt-3 text-sm text-muted-text">
                <span className="font-semibold text-or-light">Lieu — </span>
                {formation.lieu}
              </p>
            )}
          </div>
          <MediaFrame
            src={resolveFormationCoverUrl(formation.slug, formation.coverImageUrl)}
            mimeType={formation.coverImageMimeType ?? "image/jpeg"}
            alt={`Visuel plateau — ${formation.titreCourt}`}
            aspect="video"
            className={formation.prioritaire ? "gold-glow" : undefined}
          />
        </div>

        <div className="max-w-3xl">
          <SectionHeader
            eyebrow="Finalité"
            title="Ce que cette formation change"
            align="left"
            className="mb-6 md:mb-8"
          />
          <p className="leading-relaxed text-muted-text">
            {formation.contexteFinalite ?? formation.intro}
          </p>
          {formation.contexteFinalite && (
            <p className="mt-4 leading-relaxed text-muted-text">{formation.intro}</p>
          )}
        </div>

        <div>
          <SectionHeader
            eyebrow="Objectifs pédagogiques"
            title="À l'issue, tu seras capable de"
            className="mb-8 md:mb-10"
          />
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

        {competences.length > 0 && (
          <div>
            <SectionHeader
              eyebrow="Compétences visées"
              title="Ce que tu développes"
              className="mb-8 md:mb-10"
            />
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {competences.map((c) => (
                <li key={c} className="card-stage p-5 text-sm text-cream/90">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <SectionHeader
            eyebrow="Programme"
            title="Déroulement de la formation"
            className="mb-8 md:mb-10"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {formation.programme.map((module, i) => (
              <div key={`${module.titre}-${i}`} className="card-stage p-6">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-or-light">
                  {module.jour != null
                    ? `Jour ${String(module.jour).padStart(2, "0")}`
                    : `Module ${String(i + 1).padStart(2, "0")}`}
                </span>
                <h3 className="mt-2 font-heading text-xl text-cream">{module.titre}</h3>
                {module.objectifJournee && (
                  <p className="mt-2 text-sm font-medium text-or-light">{module.objectifJournee}</p>
                )}
                {module.detail && (
                  <p className="mt-2 text-sm text-muted-text">{module.detail}</p>
                )}
                {module.sequences && module.sequences.length > 0 && (
                  <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
                    {module.sequences.map((seq) => (
                      <li
                        key={seq.titre}
                        className="flex items-start justify-between gap-3 text-sm text-cream/85"
                      >
                        <span>{seq.titre}</span>
                        {seq.duree && (
                          <span className="shrink-0 text-xs text-muted-text">{seq.duree}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader
            eyebrow="Inclus"
            title="Ce qui est inclus"
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
              moyens[0] ? moyens[0].replace(/^·\s*/, "") : null,
              formation.encadrement
                ? `Encadrement — ${formation.encadrement.split(".")[0]}.`
                : null,
            ]
              .filter((item): item is string => Boolean(item))
              .slice(0, 8)
              .map((item) => (
                <li
                  key={item}
                  className="card-stage flex items-start gap-3 p-4 text-sm text-cream/90"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-projector shadow-[0_0_6px_var(--projector-glow)]" />
                  {item}
                </li>
              ))}
          </ul>
        </div>

        <div>
          <SectionHeader eyebrow="Livrables" title="Tu repars avec" className="mb-8 md:mb-10" />
          <ul className="grid gap-3 md:grid-cols-2">
            {livrables.map((item) => (
              <li
                key={item}
                className="card-stage flex items-start gap-3 p-4 text-sm text-cream/90"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-or shadow-[0_0_6px_var(--or-glow)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {(methodes.length > 0 || moyens.length > 0 || formation.encadrement) && (
          <div className="grid max-w-3xl gap-10">
            {methodes.length > 0 && (
              <div>
                <h3 className="font-heading text-xl text-cream">Méthodes pédagogiques</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-text">
                  {methodes.map((m) => (
                    <li key={m}>· {m}</li>
                  ))}
                </ul>
              </div>
            )}
            {moyens.length > 0 && (
              <div>
                <h3 className="font-heading text-xl text-cream">Moyens techniques</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-text">
                  {moyens.map((m) => (
                    <li key={m}>· {m}</li>
                  ))}
                </ul>
              </div>
            )}
            {formation.encadrement && (
              <div>
                <h3 className="font-heading text-xl text-cream">Encadrement</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-text">
                  {formation.encadrement}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="max-w-3xl">
          <SectionHeader
            eyebrow="Financement & accès"
            title="Comment s'inscrire"
            align="left"
            className="mb-6 md:mb-8"
          />
          {financementLabels.length > 0 && (
            <p className="text-sm text-muted-text">
              Financements éligibles :{" "}
              <span className="text-or-light">{financementLabels.join(" · ")}</span>
            </p>
          )}
          {formation.modalitesAccesFinancement && (
            <p className="mt-4 leading-relaxed text-muted-text">
              {formation.modalitesAccesFinancement}
            </p>
          )}
          {formation.delaiAcces && (
            <p className="mt-4 text-sm text-muted-text">
              <span className="font-semibold text-or-light">Délai d&apos;accès — </span>
              {formation.delaiAcces}
            </p>
          )}
          {formation.evaluation && (
            <p className="mt-4 text-sm text-muted-text">
              <span className="font-semibold text-or-light">Évaluation — </span>
              {formation.evaluation}
            </p>
          )}
          {formation.accessibilite && (
            <p className="mt-4 text-sm text-muted-text">
              <span className="font-semibold text-or-light">Accessibilité — </span>
              {formation.accessibilite}
            </p>
          )}
          <div className="mt-8">
            <ButtonLink
              href="/financement"
              className="btn-outline-warm rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wider"
            >
              Vérifier mon financement
            </ButtonLink>
          </div>
        </div>

        {linkedIntervenants.length > 0 && (
          <div>
            <SectionHeader eyebrow="Intervenants" title="Encadré par" className="mb-8 md:mb-10" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {linkedIntervenants.map((i) => (
                <IntervenantCard key={i.slug} intervenant={i} />
              ))}
            </div>
          </div>
        )}

        {formation.faq.length > 0 && (
          <div className="max-w-3xl">
            <SectionHeader
              eyebrow="FAQ"
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
          <h2 className="section-title text-cream">Prêt à te lancer ?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-text">
            Contacte-nous pour t&apos;inscrire ou vérifier le financement de cette formation.
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
      </div>
    </>
  );
}
