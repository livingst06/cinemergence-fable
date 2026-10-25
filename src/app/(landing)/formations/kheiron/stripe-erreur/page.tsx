import type { Metadata } from "next";

import { KHEIRON_MEDIA } from "@/features/kheiron/config";

export const metadata: Metadata = {
  title: "Paiement interrompu — Masterclass Stand-Up · Cinémergence",
  robots: { index: false, follow: false },
};

export default function KheironStripeErreurPage() {
  return (
    <main className="kheiron-merci">
      <div className="box">
        <div className="logo">
          <img src={`${KHEIRON_MEDIA}/images/logo-cinemergence.png`} alt="Cinémergence" width={455} height={160} />
        </div>
        <h1>Ce paiement n&apos;est pas passé</h1>
        <p>
          Stripe n&apos;a pas encaissé la place. Les 5 premiers paiements à 1&nbsp;290&nbsp;€ sont déjà pris&nbsp;: ce lien s&apos;arrête là.
        </p>
        <p>La suite se réserve à 1&nbsp;490&nbsp;€, sur la page de la masterclass.</p>
        <p>
          <a className="back" href="/formations/kheiron">
            Revenir à la masterclass
          </a>
        </p>
        <p>
          <a href="https://wa.me/33769185594" target="_blank" rel="noopener">
            Une question ? Écris-nous sur WhatsApp
          </a>
        </p>
      </div>
    </main>
  );
}
