import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MesSessionsStaff } from "@/features/formations/MesSessionsStaff";
import { getSessionProfile } from "@/lib/session-profile";
import { listSessionsForStaff, type StaffKind } from "@/lib/staff-sessions";

export const metadata: Metadata = {
  title: "Mes sessions",
  robots: { index: false, follow: false },
};

export default async function MesSessionsPage() {
  const profile = await getSessionProfile();
  if (!profile.clerkUser) {
    redirect("/sign-in?redirect_url=/mes-sessions");
  }

  const kind: StaffKind | null = profile.isFormateurEligible
    ? "formateur"
    : profile.isIntervenantEligible
      ? "intervenant"
      : null;
  if (!kind) {
    redirect("/");
  }

  const emails = [
    profile.email,
    ...profile.clerkUser.emailAddresses.map((entry) => entry.emailAddress),
  ].filter((value): value is string => Boolean(value));

  const sessions = await listSessionsForStaff(
    profile.payloadUserId,
    emails,
    kind,
  );

  return <MesSessionsStaff kind={kind} sessions={sessions} />;
}
