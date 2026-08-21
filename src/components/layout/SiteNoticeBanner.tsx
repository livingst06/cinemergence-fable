type SiteNoticeBannerProps = {
  nda: string;
};

export function SiteNoticeBanner({ nda }: SiteNoticeBannerProps) {
  return (
    <div
      className="site-notice-banner fixed inset-x-0 top-0 z-[100000] pt-[env(safe-area-inset-top,0px)]"
      role="note"
    >
      <p className="container-page min-h-9 py-2 text-left font-sans text-[11px] font-medium leading-snug md:min-h-11 md:text-sm">
        Cinémergence est un organisme de formation professionnelle déclaré sous le numéro NDA{" "}
        <span className="whitespace-nowrap">{nda}</span>, enregistré auprès de la DREETS
        Île-de-France.
      </p>
    </div>
  );
}
