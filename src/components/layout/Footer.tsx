import Image from "next/image";
import Link from "next/link";

import { NdaNumber } from "@/components/NdaNumber";
import { QualiopiMark } from "@/components/brand/QualiopiMark";
import { InstagramIcon, YoutubeIcon } from "@/components/brand/SocialIcons";
import type { SiteConfig } from "@/lib/data";

type FooterProps = {
  site: SiteConfig;
  formations: { slug: string; titreCourt: string; prioritaire?: boolean }[];
};

export function Footer({ site, formations }: FooterProps) {
  const featured = formations.filter((f) => f.prioritaire);
  const footerFormations = featured.length > 0 ? featured : formations.slice(0, 3);

  return (
    <footer className="site-footer border-t border-border bg-noir-secondary">
      <div className="container-page py-10 md:py-16">
        <div className="grid grid-cols-2 items-start gap-x-6 gap-y-10 md:gap-x-10 md:gap-y-12 lg:grid-cols-4">
          <div className="hidden min-w-0 lg:block">
            <QualiopiMark size="sm" />
          </div>

          <div className="min-w-0">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-or-light">
              Formations
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/formations"
                  className="text-sm font-semibold text-or-light transition-colors hover:text-projector-light"
                >
                  Toutes les formations
                </Link>
              </li>
              {footerFormations.map((f) => (
                <li key={f.slug}>
                  <Link
                    href={`/formations/${f.slug}`}
                    className="text-sm text-cream/70 transition-colors hover:text-or-light"
                  >
                    {f.titreCourt}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-or-light">
              Informations
            </h3>
            <ul className="space-y-2 text-sm text-cream/70">
              <li>
                <Link href="/intervenants" className="transition-colors hover:text-or-light">
                  Intervenants
                </Link>
              </li>
              <li>
                <Link href="/financement" className="transition-colors hover:text-or-light">
                  Financement
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors hover:text-or-light">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/association" className="transition-colors hover:text-or-light">
                  Qui sommes-nous ?
                </Link>
              </li>
              <li>
                <Link href="/galerie" className="transition-colors hover:text-or-light">
                  Galerie
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-or-light">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 min-w-0 lg:col-span-1">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-or-light">
              Contact
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-cream/70 lg:grid-cols-1">
              <ul className="space-y-2">
                <li>
                  <a
                    href={`mailto:${site.email}`}
                    className="break-words transition-colors hover:text-or-light"
                  >
                    {site.email}
                  </a>
                </li>
                <li>{site.city}</li>
                {(site.instagramUrl || site.youtubeUrl) && (
                  <li className="flex items-center gap-3 pt-1">
                    {site.instagramUrl && (
                      <a
                        href={site.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram Cinémergence"
                        className="text-cream/70 transition-colors hover:text-or-light"
                      >
                        <InstagramIcon />
                      </a>
                    )}
                    {site.youtubeUrl && (
                      <a
                        href={site.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube Cinémergence"
                        className="text-cream/70 transition-colors hover:text-or-light"
                      >
                        <YoutubeIcon />
                      </a>
                    )}
                  </li>
                )}
              </ul>
              <div>
                <p className="text-xs text-muted-text">{site.partnerRole}</p>
                <a
                  href={site.partnerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${site.partnerName} — site officiel`}
                  className="logo-plate mt-2 inline-flex items-center justify-center rounded-md px-2 py-1.5 transition hover:opacity-90"
                >
                  <Image
                    src="/images/brand/partners/bakelite-films.png"
                    alt=""
                    width={124}
                    height={175}
                    className="relative z-[1] h-9 w-auto object-contain"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        <QualiopiMark className="mt-10 w-full flex-row gap-4 lg:hidden" size="sm" />

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.06] pt-8 text-xs text-muted-text md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p>© {new Date().getFullYear()} {site.name}</p>
            <p>
              NDA <NdaNumber nda={site.nda} />
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/mentions-legales" className="transition-colors hover:text-or-light">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="transition-colors hover:text-or-light">
              Confidentialité
            </Link>
            <Link href="/cgv" className="transition-colors hover:text-or-light">
              CGV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
