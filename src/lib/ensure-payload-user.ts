import "server-only";

import { currentUser } from "@clerk/nextjs/server";

import { ensureUsersRoleEnum } from "@/lib/ensure-user-roles";
import { getPayloadClient } from "@/lib/payload";
import { roleForNewUser, syncedRoleForExistingUser } from "@/lib/user-roles";

/** Crée / lie le doc Payload `users` pour le Clerk courant. */
export async function ensurePayloadUserForClerk() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const payload = await getPayloadClient();
  await ensureUsersRoleEnum(payload);
  const byClerkId = await payload.find({
    collection: "users",
    where: { clerkId: { equals: clerkUser.id } },
    limit: 1,
  });
  if (byClerkId.docs[0]) {
    const existing = byClerkId.docs[0];
    const role = syncedRoleForExistingUser(email, existing.role);
    if (existing.role === role) return existing;
    return payload.update({
      collection: "users",
      id: existing.id,
      data: { role },
      overrideAccess: true,
    });
  }

  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");

  const byEmail = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
  });
  if (byEmail.docs[0]) {
    const existing = byEmail.docs[0];
    return payload.update({
      collection: "users",
      id: existing.id,
      data: {
        clerkId: clerkUser.id,
        role: syncedRoleForExistingUser(email, existing.role),
      },
      overrideAccess: true,
    });
  }

  return payload.create({
    collection: "users",
    data: {
      email,
      name: fullName || undefined,
      clerkId: clerkUser.id,
      role: roleForNewUser(email),
    },
    overrideAccess: true,
  });
}
