import type { Metadata } from "next";

import { KHEIRON_MEDIA } from "@/features/kheiron/config";

export const metadata: Metadata = {
  title: "Place réservée — Masterclass Stand-Up · Cinémergence",
  robots: { index: false, follow: false },
};

export default function KheironMerciPage() {
  return (
    <main className="kheiron-merci">
      <div className="box">
        <div className="logo">
          <img src={`${KHEIRON_MEDIA}/images/logo-cinemergence.png`} alt="Cinémergence" width={455} height={160} />
        </div>
        <h1>Ta place est réservée&nbsp;!</h1>
        <p>Merci, ton paiement est bien enregistré. Tu reçois une confirmation par email dans quelques minutes.</p>
        <ol>
          <li><b>Confirmation par email</b> avec ton reçu et le récapitulatif du stage.</li>
          <li><b>Un message à J-7 et à J-1</b> avec l&apos;adresse, les horaires et ce qu&apos;il faut préparer.</li>
          <li><b>Samedi 28 novembre :</b> rendez-vous au Théâtre Apollo pour la masterclass avec Kheiron.</li>
        </ol>
        <p>Rappel : le stage est confirmé dès 10 inscrits. S&apos;il n&apos;a pas lieu, tu es remboursé·e intégralement.</p>
        <p><a href="https://wa.me/33769185594" target="_blank" rel="noopener">Une question ? Écris-nous sur WhatsApp</a></p>
      </div>
    </main>
  );
}
