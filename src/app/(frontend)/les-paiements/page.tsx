import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LesPaiementsAdmin } from "@/features/inscriptions/LesPaiementsAdmin";
import { listAdminPaiements } from "@/lib/admin-paiements";
import { getSessionProfile } from "@/lib/session-profile";

export const metadata: Metadata = {
  title: "Les paiements",
  robots: { index: false, follow: false },
};

export default async function LesPaiementsPage() {
  const profile = await getSessionProfile();
  if (!profile.clerkUser) {
    redirect("/sign-in?redirect_url=/les-paiements");
  }
  if (!profile.isAdminEligible) {
    redirect("/");
  }

  const paiements = await listAdminPaiements();

  return <LesPaiementsAdmin paiements={paiements} />;
}
