import { NextResponse } from "next/server";

import { avatarSrc } from "@/lib/avatars";
import { getSessionProfile } from "@/lib/session-profile";

export const dynamic = "force-dynamic";

/** Avatar et rôles d’en-tête, après l’envoi du HTML. */
export async function GET() {
  const profile = await getSessionProfile();
  if (!profile.clerkUser) {
    return NextResponse.json(
      { signedIn: false },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return NextResponse.json(
    {
      signedIn: true,
      avatarSrc: avatarSrc(profile.avatarKey),
      isFormateurEligible: profile.isFormateurEligible,
      isIntervenantEligible: profile.isIntervenantEligible,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
