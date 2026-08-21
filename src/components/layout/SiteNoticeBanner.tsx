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
        <strong className="font-bold">Cinémergence</strong> est un{" "}
        <strong className="font-bold">organisme de formation professionnelle</strong> déclaré
        sous le numéro{" "}
        <strong className="whitespace-nowrap font-bold">NDA {nda}</strong>, enregistré auprès
        de la DREETS Île-de-France.
      </p>
    </div>
  );
}
