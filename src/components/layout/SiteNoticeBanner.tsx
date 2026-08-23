import { X } from "lucide-react";

type SiteNoticeBannerProps = {
  nda: string;
};

export function SiteNoticeBanner({ nda }: SiteNoticeBannerProps) {
  return (
    <div
      className="site-notice-banner pointer-events-auto fixed inset-x-0 top-0 z-[100000] flex items-center pt-[env(safe-area-inset-top,0px)] pr-[max(0.75rem,env(safe-area-inset-right,0px))]"
      role="region"
      aria-label="Mention légale"
    >
      <label
        htmlFor="site-notice-dismiss"
        className="absolute inset-0 z-10 cursor-pointer md:hidden"
        aria-hidden
      />
      <p
        className="relative z-0 min-w-0 flex-1 overflow-hidden py-2.5 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-2 text-left font-sans text-xs font-medium leading-snug md:py-5 md:pl-[max(1.5rem,env(safe-area-inset-left,0px))] md:text-sm lg:pl-[max(2rem,env(safe-area-inset-left,0px))]"
        // Safari / Chrome iOS : ne pas transformer le NDA en <a href="tel:…">
        {...{ "x-apple-data-detectors": "false" }}
      >
        <strong className="font-bold">Cinémergence</strong> est un{" "}
        <strong className="font-bold">organisme de formation professionnelle</strong> déclaré
        sous le numéro{" "}
        <strong className="whitespace-nowrap font-bold">NDA {nda}</strong>, enregistré auprès
        de la DREETS Île-de-France.
      </p>
      <label className="relative z-20 inline-flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 cursor-pointer items-center justify-center md:h-7 md:min-h-7 md:w-7 md:min-w-7">
        <input
          type="checkbox"
          id="site-notice-dismiss"
          className="native-touch-control"
          aria-label="Fermer le bandeau"
        />
        <span
          className="pointer-events-none inline-flex h-6 w-6 items-center justify-center rounded-full border border-white md:h-7 md:w-7"
          aria-hidden
        >
          <X className="h-3 w-3 md:h-3.5 md:w-3.5" strokeWidth={2.5} />
        </span>
      </label>
    </div>
  );
}
