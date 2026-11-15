import Image from "next/image";
import Link from "next/link";

import { ManageCookiesButton } from "@/components/ManageCookiesButton";
import { NdaNumber } from "@/components/NdaNumber";
import { QualiopiMark } from "@/components/brand/QualiopiMark";
import {
  InstagramIcon,
  LinkedInIcon,
  LinktreeIcon,
  TikTokIcon,
  YoutubeIcon,
} from "@/components/brand/SocialIcons";
import type { SiteConfig } from "@/lib/data";
import { formationPath } from "@/lib/defaults";

type FooterProps = {
  site: SiteConfig;
  formations: { slug: string; titreCourt: string; prioritaire?: boolean }[];
};

const socialIconClass = "h-5 w-5";

export function Footer({ site, formations }: FooterProps) {
  const featured = formations.filter((f) => f.prioritaire);
  const footerFormations = featured.length > 0 ? featured : formations.slice(0, 3);
  const socials = [
    { href: site.instagramUrl, label: "Instagram Cinémergence", icon: <InstagramIcon className={socialIconClass} /> },
    { href: site.youtubeUrl, label: "YouTube Cinémergence", icon: <YoutubeIcon className={socialIconClass} /> },
    { href: site.tiktokUrl, label: "TikTok Cinémergence", icon: <TikTokIcon className={socialIconClass} /> },
    { href: site.linktreeUrl, label: "Linktree Cinémergence", icon: <LinktreeIcon className={socialIconClass} /> },
    { href: site.linkedinUrl, label: "LinkedIn Cinémergence", icon: <LinkedInIcon className={socialIconClass} /> },
  ];

  return (
    <footer className="site-footer border-t border-border bg-noir-secondary">
      <div className="container-page py-10 md:py-16">
        <nav aria-label="Réseaux sociaux" className="mb-10 flex justify-center md:mb-14">
          <ul className="flex items-center justify-center gap-3 sm:gap-4">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-noir text-cream transition-colors hover:bg-noir-deep hover:text-or-light sm:h-12 sm:w-12"
                >
                  {social.icon}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid grid-cols-2 items-start gap-x-6 gap-y-10 md:gap-x-10 md:gap-y-12 lg:grid-cols-4">
          <div className="hidden min-w-0 lg:block">
            <QualiopiMark size="sm" />
          </div>

          <div className="min-w-0">
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
                    href={formationPath(f.slug)}
                    className="text-sm text-cream/70 transition-colors hover:text-or-light"
                  >
                    {f.titreCourt}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
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
            <h3 className="mb-4 text-sm font-semibold text-or-light">
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

        <QualiopiMark className="mt-10 lg:hidden" size="sm" />

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
            <ManageCookiesButton className="cursor-pointer bg-transparent p-0 text-left transition-colors hover:text-or-light" />
          </div>
        </div>
      </div>
    </footer>
  );
}
