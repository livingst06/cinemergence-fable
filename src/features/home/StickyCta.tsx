import { ButtonLink } from "@/components/ui/ButtonLink";

export function StickyCta() {
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-border bg-noir-secondary/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] shadow-[0_-8px_32px_rgba(0,0,0,0.25)] backdrop-blur-md md:px-6 md:py-5 md:pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]">
        <div className="flex justify-center">
          <div className="flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-center sm:gap-4">
            <ButtonLink
              href="/formations"
              size="lg"
              className="btn-outline-warm h-14 min-h-14 justify-center rounded-lg px-8 text-sm font-semibold uppercase tracking-wider md:h-16 md:min-h-16 md:px-10 md:text-base"
            >
              Voir les formations
            </ButtonLink>
            <ButtonLink
              href="/contact"
              size="lg"
              className="btn-cta h-14 min-h-14 justify-center px-8 text-sm md:h-16 md:min-h-16 md:px-10 md:text-base"
            >
              Je réserve ma place
            </ButtonLink>
          </div>
        </div>
      </div>
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:h-[calc(6.5rem+env(safe-area-inset-bottom,0px))]" aria-hidden />
    </>
  );
}
