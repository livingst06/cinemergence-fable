import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LesSessionsAdmin } from "@/features/formations/LesSessionsAdmin";
import {
  listFormationsForSessionSelect,
  listIntervenantsForSessionSelect,
} from "@/features/formations/session-actions";
import { listAdminSessionGroups } from "@/lib/admin-sessions";
import { getSessionProfile } from "@/lib/session-profile";

export const metadata: Metadata = {
  title: "Les sessions",
  robots: { index: false, follow: false },
};

export default async function LesSessionsPage() {
  const profile = await getSessionProfile();
  if (!profile.clerkUser) {
    redirect("/sign-in?redirect_url=/les-sessions");
  }
  if (!profile.isAdminEligible) {
    redirect("/");
  }

  const [sessions, formations, intervenants] = await Promise.all([
    listAdminSessionGroups(),
    listFormationsForSessionSelect(),
    listIntervenantsForSessionSelect(),
  ]);

  return (
    <LesSessionsAdmin
      sessions={sessions}
      formations={formations}
      intervenants={intervenants}
    />
  );
}
