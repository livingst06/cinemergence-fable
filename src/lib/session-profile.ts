import "server-only";

import { currentUser, type User } from "@clerk/nextjs/server";

import { isAdminEmail } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";

export type SessionProfile = {
  clerkUser: User | null;
  email: string | null;
  role: "admin" | "stagiaire" | null;
  isAdminEligible: boolean;
  payloadUserId: number | string | null;
};

function primaryEmail(user: User): string | null {
  return (
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null
  );
}

function emptyProfile(): SessionProfile {
  return {
    clerkUser: null,
    email: null,
    role: null,
    isAdminEligible: false,
    payloadUserId: null,
  };
}

export async function getSessionProfile(): Promise<SessionProfile> {
  let clerkUser: User | null;
  try {
    clerkUser = await currentUser();
  } catch (err) {
    // iOS demande /apple-touch-icon.png : le matcher Clerk ignore les .png,
    // currentUser() plante alors que la route n’a pas traversé clerkMiddleware.
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("clerkMiddleware")) {
      return emptyProfile();
    }
    throw err;
  }
  if (!clerkUser) {
    return emptyProfile();
  }

  const email = primaryEmail(clerkUser);
  const isAdminEligible = isAdminEmail(email);

  try {
    const payload = await getPayloadClient();
    const byClerkId = await payload.find({
      collection: "users",
      where: { clerkId: { equals: clerkUser.id } },
      limit: 1,
    });
    let doc = byClerkId.docs[0];

    if (!doc && email) {
      const byEmail = await payload.find({
        collection: "users",
        where: { email: { equals: email } },
        limit: 1,
      });
      doc = byEmail.docs[0];
    }

    const role =
      doc?.role === "admin" || doc?.role === "stagiaire"
        ? doc.role
        : isAdminEligible
          ? "admin"
          : "stagiaire";

    return {
      clerkUser,
      email,
      role,
      isAdminEligible,
      payloadUserId: doc?.id ?? null,
    };
  } catch {
    return {
      clerkUser,
      email,
      role: isAdminEligible ? "admin" : "stagiaire",
      isAdminEligible,
      payloadUserId: null,
    };
  }
}

/** Guard serveur — utilisateur Clerk connecté. */
export async function requireAuth(): Promise<
  { ok: true; profile: SessionProfile } | { ok: false; error: string }
> {
  const profile = await getSessionProfile();
  if (!profile.clerkUser) {
    return { ok: false, error: "Connexion requise" };
  }
  return { ok: true, profile };
}

/** Guard serveur pour mutations admin — source de vérité = ADMIN_LIST. */
export async function requireAdmin(): Promise<
  { ok: true; profile: SessionProfile } | { ok: false; error: string }
> {
  const profile = await getSessionProfile();
  if (!profile.email || !isAdminEmail(profile.email)) {
    return { ok: false, error: "Non autorisé" };
  }
  return { ok: true, profile };
}
