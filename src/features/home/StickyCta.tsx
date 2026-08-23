import { ButtonLink } from "@/components/ui/ButtonLink";

export function StickyCta() {
  return (
    <>
      <div
        data-sticky-cta
        className="fixed inset-x-0 bottom-0 z-[90] border-t border-border bg-noir-secondary/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] shadow-[0_-8px_32px_rgba(0,0,0,0.25)] backdrop-blur-md md:px-6 md:py-4 md:pb-[max(1rem,env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex justify-center">
          <div className="flex w-full max-w-3xl flex-row items-stretch justify-center gap-2 sm:gap-4">
            <ButtonLink
              href="/contact"
              size="lg"
              className="btn-cta h-12 min-h-12 flex-1 justify-center px-3 text-center text-sm leading-tight sm:h-14 sm:min-h-14 sm:px-8 md:h-16 md:min-h-16 md:px-10 md:text-base"
            >
              Je réserve ma place
            </ButtonLink>
            <ButtonLink
              href="/formations"
              size="lg"
              className="btn-outline-warm h-12 min-h-12 flex-1 justify-center rounded-lg px-3 text-center text-sm font-semibold leading-tight sm:h-14 sm:min-h-14 sm:px-8 md:h-16 md:min-h-16 md:px-10 md:text-base"
            >
              Voir les formations
            </ButtonLink>
          </div>
        </div>
      </div>
      <div
        className="h-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:h-[calc(6rem+env(safe-area-inset-bottom,0px))]"
        aria-hidden
      />
    </>
  );
}
