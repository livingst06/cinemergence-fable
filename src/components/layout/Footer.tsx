import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
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
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 xl:gap-12">
          <div className="min-w-0 md:col-span-2 xl:col-span-3 2xl:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-text" {...{ "x-apple-data-detectors": "false" }}>
              NDA {site.nda}
            </p>
            <QualiopiMark className="mt-5" size="sm" />
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-or-light">
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

          <div>
            <h3 className="mb-4 text-sm font-semibold text-or-light">
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

          <div>
            <h3 className="mb-4 text-sm font-semibold text-or-light">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-cream/70">
              <li>
                <a href={`mailto:${site.email}`} className="transition-colors hover:text-or-light">
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
              <li className="pt-2">
                <p className="text-sm text-muted-text">{site.partnerRole}</p>
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
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.06] pt-8 text-sm text-muted-text md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site.name}</p>
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
