import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LesUtilisateursAdmin } from "@/features/users/LesUtilisateursAdmin";
import { listLoggedInUsers } from "@/lib/admin-users";
import { getSessionProfile } from "@/lib/session-profile";

export const metadata: Metadata = {
  title: "Les utilisateurs",
  robots: { index: false, follow: false },
};

export default async function LesUtilisateursPage() {
  const profile = await getSessionProfile();
  if (!profile.clerkUser) {
    redirect("/sign-in?redirect_url=/les-utilisateurs");
  }
  if (!profile.isAdminEligible) {
    redirect("/");
  }

  const users = await listLoggedInUsers();
  return <LesUtilisateursAdmin users={users} />;
}
