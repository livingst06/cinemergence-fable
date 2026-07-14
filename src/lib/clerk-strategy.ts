import { createClerkClient, verifyToken } from "@clerk/backend";
import type { AuthStrategy, AuthStrategyResult } from "payload";

function extractSessionToken(headers: Request["headers"]): string | null {
  const authHeader = headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }

  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)__session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Stratégie d'authentification Payload qui délègue entièrement l'identité à Clerk.
 * Upsert paresseux du document `users` : lié par clerkId, puis par email (migration
 * en douceur des comptes locaux existants), sinon création avec role "stagiaire".
 */
export const clerkStrategy: AuthStrategy = {
  name: "clerk",
  authenticate: async ({ payload, headers }): Promise<AuthStrategyResult> => {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      payload.logger.error("[clerk-strategy] CLERK_SECRET_KEY manquant");
      return { user: null };
    }

    const token = extractSessionToken(headers);
    if (!token) return { user: null };

    let clerkUserId: string;
    try {
      const claims = await verifyToken(token, { secretKey });
      clerkUserId = claims.sub;
    } catch {
      return { user: null };
    }

    const byClerkId = await payload.find({
      collection: "users",
      where: { clerkId: { equals: clerkUserId } },
      limit: 1,
    });

    if (byClerkId.docs[0]) {
      return { user: { collection: "users", ...byClerkId.docs[0] } };
    }

    const clerkClient = createClerkClient({ secretKey });
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) return { user: null };

    const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");

    const byEmail = await payload.find({
      collection: "users",
      where: { email: { equals: email } },
      limit: 1,
    });

    if (byEmail.docs[0]) {
      const linked = await payload.update({
        collection: "users",
        id: byEmail.docs[0].id,
        data: { clerkId: clerkUserId },
      });
      return { user: { collection: "users", ...linked } };
    }

    const created = await payload.create({
      collection: "users",
      data: {
        email,
        name: fullName || undefined,
        clerkId: clerkUserId,
        role: "stagiaire",
      },
    });

    return { user: { collection: "users", ...created } };
  },
};
