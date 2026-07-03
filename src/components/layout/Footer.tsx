import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import type { SiteConfig } from "@/lib/data";

type FooterProps = {
  site: SiteConfig;
  formations: { slug: string; titreCourt: string }[];
};

export function Footer({ site, formations }: FooterProps) {
  return (
    <footer className="border-t border-white/[0.06] bg-noir-deep">
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-text">
              {site.description}
            </p>
            <p className="mt-4 text-xs text-muted-text">
              NDA {site.nda}
              <br />
              {site.qualiopiObtained ? "Certifié Qualiopi" : site.qualiopiLabel}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-or-light">
              Formations
            </h3>
            <ul className="space-y-2">
              {formations.map((f) => (
                <li key={f.slug}>
                  <Link
                    href={`/${f.slug}`}
                    className="text-sm text-cream/70 transition-colors hover:text-or-light"
                  >
                    {f.titreCourt}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
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
                <Link href="/association" className="transition-colors hover:text-or-light">
                  L&apos;association
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
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-or-light">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-cream/70">
              <li>
                <a href={`mailto:${site.email}`} className="transition-colors hover:text-or-light">
                  {site.email}
                </a>
              </li>
              <li>{site.city}</li>
              {site.instagramUrl && (
                <li>
                  <a
                    href={site.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-or-light"
                  >
                    Instagram
                  </a>
                </li>
              )}
              <li className="pt-2 text-xs text-muted-text">
                {site.partnerRole}: {site.partnerName}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.06] pt-8 text-xs text-muted-text md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site.legalName}</p>
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
