import "server-only";

import { currentUser } from "@clerk/nextjs/server";

import { roleForEmail } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";

/** Crée / lie le doc Payload `users` pour le Clerk courant. */
export async function ensurePayloadUserForClerk() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const payload = await getPayloadClient();
  const byClerkId = await payload.find({
    collection: "users",
    where: { clerkId: { equals: clerkUser.id } },
    limit: 1,
  });
  if (byClerkId.docs[0]) return byClerkId.docs[0];

  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");
  const role = roleForEmail(email);

  const byEmail = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
  });
  if (byEmail.docs[0]) {
    return payload.update({
      collection: "users",
      id: byEmail.docs[0].id,
      data: { clerkId: clerkUser.id, role },
      overrideAccess: true,
    });
  }

  return payload.create({
    collection: "users",
    data: {
      email,
      name: fullName || undefined,
      clerkId: clerkUser.id,
      role,
    },
    overrideAccess: true,
  });
}
