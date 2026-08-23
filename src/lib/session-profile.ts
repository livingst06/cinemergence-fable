import "server-only";

import { currentUser, type User } from "@clerk/nextjs/server";

import { anyEmailIsAdmin, isAdminEmail } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";
import { ensureUsersAvatarKeyColumn } from "@/lib/profile";
import {
  anyEmailIsFormateur,
  anyEmailIsIntervenant,
  isFormateurEmail,
  isIntervenantEmail,
  roleForEmails,
  type UserRole,
} from "@/lib/user-roles";

let avatarColumnReady = false;

export type SessionProfile = {
  clerkUser: User | null;
  email: string | null;
  role: UserRole | null;
  isAdminEligible: boolean;
  isFormateurEligible: boolean;
  isIntervenantEligible: boolean;
  payloadUserId: number | string | null;
  avatarKey: string | null;
};

function primaryEmail(user: User): string | null {
  return (
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null
  );
}

function clerkEmails(user: User): string[] {
  return user.emailAddresses.map((entry) => entry.emailAddress).filter(Boolean);
}

function emptyProfile(): SessionProfile {
  return {
    clerkUser: null,
    email: null,
    role: null,
    isAdminEligible: false,
    isFormateurEligible: false,
    isIntervenantEligible: false,
    payloadUserId: null,
    avatarKey: null,
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
  const emails = [email, ...clerkEmails(clerkUser)];
  const isAdminEligible = anyEmailIsAdmin(emails);
  const isFormateurEligible = anyEmailIsFormateur(emails);
  const isIntervenantEligible = anyEmailIsIntervenant(emails);
  const role = roleForEmails(emails);

  try {
    const payload = await getPayloadClient();
    if (!avatarColumnReady) {
      try {
        await ensureUsersAvatarKeyColumn(payload);
        avatarColumnReady = true;
      } catch {
        /* colonne déjà là, ou pas encore de table users */
      }
    }
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

    return {
      clerkUser,
      email,
      role,
      isAdminEligible,
      isFormateurEligible,
      isIntervenantEligible,
      payloadUserId: doc?.id ?? null,
      avatarKey:
        typeof doc?.avatarKey === "string" && doc.avatarKey.trim()
          ? String(doc.avatarKey)
          : null,
    };
  } catch {
    return {
      clerkUser,
      email,
      role,
      isAdminEligible,
      isFormateurEligible,
      isIntervenantEligible,
      payloadUserId: null,
      avatarKey: null,
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

export async function requireFormateur(): Promise<
  { ok: true; profile: SessionProfile } | { ok: false; error: string }
> {
  const profile = await getSessionProfile();
  if (!profile.email || !isFormateurEmail(profile.email)) {
    return { ok: false, error: "Non autorisé" };
  }
  return { ok: true, profile };
}

export async function requireIntervenant(): Promise<
  { ok: true; profile: SessionProfile } | { ok: false; error: string }
> {
  const profile = await getSessionProfile();
  if (!profile.email || !isIntervenantEmail(profile.email)) {
    return { ok: false, error: "Non autorisé" };
  }
  return { ok: true, profile };
}
