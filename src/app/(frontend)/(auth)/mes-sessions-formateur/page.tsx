import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StaffSessionsScreen } from "@/features/formations/StaffSessionsScreen";
import { listSessionGroupsForStaff } from "@/lib/staff-sessions";
import { getSessionProfile } from "@/lib/session-profile";

export const metadata: Metadata = {
  title: "Sessions formateur",
  robots: { index: false, follow: false },
};

export default async function MesSessionsFormateurPage() {
  const profile = await getSessionProfile();
  if (!profile.clerkUser) {
    redirect("/sign-in?redirect_url=/mes-sessions-formateur");
  }
  if (!profile.isFormateurEligible) {
    redirect("/");
  }

  const emails = [
    profile.email,
    ...(profile.clerkUser.emailAddresses.map((entry) => entry.emailAddress) ??
      []),
  ].filter((value): value is string => Boolean(value));

  const sessions = await listSessionGroupsForStaff(emails, "formateur");

  return (
    <StaffSessionsScreen
      eyebrow="Espace formateur"
      title="Les sessions pour lesquelles je suis formateur"
      sessions={sessions}
    />
  );
}
