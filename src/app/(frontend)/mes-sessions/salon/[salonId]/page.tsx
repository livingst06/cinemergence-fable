import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  SalonForbiddenScreen,
  SalonSessionScreen,
} from "@/features/salon/SalonSessionScreen";
import { ensurePayloadUserForClerk } from "@/lib/ensure-payload-user";
import { getSalonPageForUser } from "@/lib/session-salon";
import { getSessionProfile } from "@/lib/session-profile";

type Props = { params: Promise<{ salonId: string }> };

export const metadata: Metadata = {
  title: "Salon de discussion",
  robots: { index: false, follow: false },
};

export default async function StaffSessionSalonPage({ params }: Props) {
  const { salonId } = await params;
  const profile = await getSessionProfile();
  if (!profile.clerkUser) {
    redirect(
      `/sign-in?redirect_url=${encodeURIComponent(`/mes-sessions/salon/${salonId}`)}`,
    );
  }
  if (!profile.isFormateurEligible && !profile.isIntervenantEligible) {
    redirect(`/mes-reservations/salon/${salonId}`);
  }

  let payloadUserId = profile.payloadUserId;
  if (!payloadUserId) {
    const user = await ensurePayloadUserForClerk();
    payloadUserId = user?.id ?? null;
  }

  const emails = [
    profile.email,
    ...profile.clerkUser.emailAddresses.map((entry) => entry.emailAddress),
  ].filter((value): value is string => Boolean(value));

  const result = await getSalonPageForUser({
    salonId,
    payloadUserId,
    email: profile.email,
    emails,
  });

  if (!result.ok && result.reason === "not_found") {
    notFound();
  }

  if (!result.ok) {
    return (
      <SalonForbiddenScreen
        backHref="/mes-sessions"
        backLabel="Retour à mes sessions"
      />
    );
  }

  return (
    <SalonSessionScreen
      salon={result.salon}
      currentUserId={payloadUserId ? String(payloadUserId) : ""}
      backHref="/mes-sessions"
      backLabel="Retour à mes sessions"
    />
  );
}
