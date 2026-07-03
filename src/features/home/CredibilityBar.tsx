import type { SiteConfig } from "@/lib/data";

type CredibilityBarProps = {
  site: SiteConfig;
};

export function CredibilityBar({ site }: CredibilityBarProps) {
  const items = [
    site.qualiopiObtained ? "Certifié Qualiopi" : site.qualiopiLabel,
    `NDA ${site.nda}`,
    "Finançable AFDAS · OPCO · CPF · France Travail",
  ];

  return (
    <section className="border-y border-white/[0.06] bg-noir-secondary/60 backdrop-blur-sm">
      <div className="container-page py-4">
        <ul className="flex flex-col items-center justify-center gap-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-text md:flex-row md:gap-10">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span className="h-1 w-1 rounded-full bg-projector shadow-[0_0_8px_var(--projector-glow)]" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
