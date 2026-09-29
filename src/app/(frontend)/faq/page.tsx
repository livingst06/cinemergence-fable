import type { Metadata } from "next";
import Link from "next/link";

import { FaqList } from "@/features/faq/FaqList";
import { faqItems } from "@/lib/faq";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "FAQ — Cinémergence",
    description:
      "Questions fréquentes sur Cinémergence : formations cinéma, certification Qualiopi, financement et inscription à Paris.",
    alternates: { canonical: "/faq" },
  };
}

export default function FaqPage() {
  return (
    <div className="container-page py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="display-title da-rule mb-8 text-convert">FAQ</h1>
        <FaqList items={faqItems} />
        <p className="mt-8 text-sm text-muted-text">
          Une autre question&nbsp;?{" "}
          <Link href="/contact" className="text-or-light underline-offset-4 hover:underline">
            Écris-nous
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
