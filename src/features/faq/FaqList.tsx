import type { FaqItem } from "@/lib/faq";

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div>
      {items.map((item) => (
        <details key={item.q} className="faq-item border-b border-white/[0.08]">
          <summary className="faq-summary py-3.5">
            <span className="flex min-h-11 items-start justify-between gap-4 text-[15px] font-medium leading-snug text-cream md:text-base">
              <span>{item.q}</span>
              <svg
                className="faq-chevron mt-0.5 size-4 shrink-0 text-muted-text"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </summary>
          <p className="pb-4 pr-8 text-sm leading-relaxed text-muted-text md:text-[15px]">
            {item.r}
          </p>
        </details>
      ))}
    </div>
  );
}
