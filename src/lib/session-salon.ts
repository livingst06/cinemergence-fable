import "server-only";

import type { Payload } from "payload";

import { isAdminEmail } from "@/lib/admin-auth";
import type { SalonPostView } from "@/lib/salon-constants";
import {
  formatFormationSessionLabel,
  PAID_ENROLLED_STATUSES,
} from "@/lib/inscription-status";
import { getPayloadClient } from "@/lib/payload";

export type { SalonPostView };

export type SalonPageView = {
  salonId: string;
  sessionId: string;
  formationTitre: string;
  sessionLabel: string | null;
  posts: SalonPostView[];
};

export type SalonPageResult =
  | { ok: true; salon: SalonPageView }
  | { ok: false; reason: "not_found" | "forbidden" };

function toPayloadId(id: number | string): number | string {
  const n = Number(id);
  return Number.isInteger(n) && String(n) === String(id).trim() ? n : id;
}

export function relationId(value: unknown): number | string | null {
  if (value == null) return null;
  if (typeof value === "object" && "id" in (value as { id?: unknown })) {
    const id = (value as { id: number | string }).id;
    return id ?? null;
  }
  if (typeof value === "number" || typeof value === "string") return value;
  return null;
}

export async function userHasPaidSeatOnSession(
  payload: Payload,
  userId: number | string,
  sessionId: number | string,
): Promise<boolean> {
  const result = await payload.find({
    collection: "inscriptions",
    where: {
      and: [
        { user: { equals: userId } },
        { session: { equals: sessionId } },
        { status: { in: [...PAID_ENROLLED_STATUSES] } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  return result.totalDocs > 0;
}

export async function ensureSalonForSession(
  payload: Payload,
  sessionId: number | string,
): Promise<{ id: number | string } | null> {
  const id = toPayloadId(sessionId);
  try {
    const existing = await payload.find({
      collection: "session-salons",
      where: { session: { equals: id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    if (existing.docs[0]) return { id: existing.docs[0].id };

    const created = await payload.create({
      collection: "session-salons",
      data: { session: id },
      overrideAccess: true,
    });
    return { id: created.id };
  } catch (error) {
    try {
      const raced = await payload.find({
        collection: "session-salons",
        where: { session: { equals: id } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      });
      if (raced.docs[0]) return { id: raced.docs[0].id };
    } catch {
      /* table absente ou contrainte */
    }
    console.error("[session-salon] ensure", sessionId, error);
    return null;
  }
}

function authorDisplayName(author: unknown): string {
  if (author && typeof author === "object") {
    const name = (author as { name?: string | null }).name;
    if (typeof name === "string" && name.trim()) return name.trim();
  }
  return "Élève";
}

export async function listSalonPosts(
  payload: Payload,
  salonId: number | string,
): Promise<SalonPostView[]> {
  const result = await payload.find({
    collection: "salon-posts",
    where: { salon: { equals: toPayloadId(salonId) } },
    depth: 1,
    limit: 100,
    sort: "createdAt",
    overrideAccess: true,
  });

  return result.docs.map((doc) => ({
    id: String(doc.id),
    body: String(doc.body ?? ""),
    authorId: String(relationId(doc.author) ?? ""),
    authorName: authorDisplayName(doc.author),
    createdAt: String(doc.createdAt ?? ""),
  }));
}

export async function getSalonPageForUser(input: {
  salonId: string;
  payloadUserId: number | string | null;
  email: string | null;
}): Promise<SalonPageResult> {
  const payload = await getPayloadClient();
  const salonId = toPayloadId(input.salonId);

  let salonDoc: {
    id: number | string;
    session?: unknown;
  };
  try {
    salonDoc = await payload.findByID({
      collection: "session-salons",
      id: salonId,
      depth: 2,
      overrideAccess: true,
    });
  } catch {
    return { ok: false, reason: "not_found" };
  }

  const sessionId = relationId(salonDoc.session);
  if (!sessionId) return { ok: false, reason: "not_found" };

  const sessionDoc =
    typeof salonDoc.session === "object" && salonDoc.session
      ? (salonDoc.session as {
          dateDebut?: string;
          dateFin?: string;
          formation?: unknown;
        })
      : null;

  const isAdmin = isAdminEmail(input.email);
  const enrolled =
    input.payloadUserId != null
      ? await userHasPaidSeatOnSession(payload, input.payloadUserId, sessionId)
      : false;
  if (!isAdmin && !enrolled) {
    return { ok: false, reason: "forbidden" };
  }

  const formation =
    sessionDoc && typeof sessionDoc.formation === "object" && sessionDoc.formation
      ? (sessionDoc.formation as {
          titre?: string;
          titreCourt?: string;
          slug?: string;
        })
      : null;

  const posts = await listSalonPosts(payload, salonDoc.id);

  return {
    ok: true,
    salon: {
      salonId: String(salonDoc.id),
      sessionId: String(sessionId),
      formationTitre: String(
        formation?.titre ?? formation?.titreCourt ?? formation?.slug ?? "Formation",
      ),
      sessionLabel: formatFormationSessionLabel(
        sessionDoc?.dateDebut ? String(sessionDoc.dateDebut) : undefined,
        sessionDoc?.dateFin ? String(sessionDoc.dateFin) : undefined,
        { month: "long" },
      ),
      posts,
    },
  };
}

export async function createSalonPostForUser(input: {
  salonId: string;
  body: string;
  payloadUserId: number | string;
  email: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const payload = await getPayloadClient();
  const salonId = toPayloadId(input.salonId);

  let salonDoc: { id: number | string; session?: unknown };
  try {
    salonDoc = await payload.findByID({
      collection: "session-salons",
      id: salonId,
      depth: 0,
      overrideAccess: true,
    });
  } catch {
    return { ok: false, error: "Salon introuvable" };
  }

  const sessionId = relationId(salonDoc.session);
  if (!sessionId) return { ok: false, error: "Salon introuvable" };

  const isAdmin = isAdminEmail(input.email);
  const enrolled = await userHasPaidSeatOnSession(
    payload,
    input.payloadUserId,
    sessionId,
  );
  if (!isAdmin && !enrolled) {
    return { ok: false, error: "Seuls les stagiaires inscrits peuvent écrire ici." };
  }

  await payload.create({
    collection: "salon-posts",
    data: {
      salon: toPayloadId(salonDoc.id),
      author: toPayloadId(input.payloadUserId),
      body: input.body,
    },
    overrideAccess: true,
  });

  return { ok: true };
}
