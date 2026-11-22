import "server-only";

import { listHorsProcessForSessions } from "@/lib/paiements-hors-process";
import { listPaiementsForSessions } from "@/lib/paiements";
import { getPayloadClient } from "@/lib/payload";

export type FormationSessionWrite = {
  formationId: string | number;
  dateDebut: string;
  dateFin: string;
  placesOffertes: number;
  label?: string | null;
  active?: boolean;
  formateurIds: Array<string | number>;
  intervenantIds: Array<string | number>;
};

export type FormationOption = {
  id: number | string;
  titre: string;
  slug: string;
  tarifEuros: number | null;
  tarif: string | null;
};

export type SessionStaffOption = {
  id: number | string;
  nom: string;
  email: string;
  role: "formateur" | "intervenant";
};

function toRelationIds(ids: Array<string | number>): Array<number | string> {
  return ids.map((id) => {
    if (typeof id === "number" && Number.isFinite(id)) return id;
    const n = Number(id);
    return Number.isInteger(n) ? n : id;
  });
}

function relationId(value: unknown): string {
  if (typeof value === "object" && value && "id" in value) {
    return String((value as { id: number | string }).id);
  }
  return String(value);
}

export async function countEnrolledForSession(sessionId: number | string): Promise<number> {
  try {
    const [paiements, horsProcess] = await Promise.all([
      listPaiementsForSessions([sessionId]),
      listHorsProcessForSessions([sessionId]),
    ]);
    return (
      (paiements.get(String(sessionId)) ?? []).length +
      (horsProcess.get(String(sessionId)) ?? []).length
    );
  } catch (error) {
    console.error("[sessions] paiements", error instanceof Error ? error.message : error);
    return 0;
  }
}

export async function createFormationSessionRecord(
  data: FormationSessionWrite,
): Promise<{ id: number | string; formationSlug: string | null }> {
  const payload = await getPayloadClient();
  const formation = await payload.findByID({
    collection: "formations",
    id: data.formationId,
    depth: 0,
    overrideAccess: true,
  });
  const created = await payload.create({
    collection: "formation-sessions",
    data: {
      formation: formation.id,
      dateDebut: data.dateDebut.slice(0, 10),
      dateFin: data.dateFin.slice(0, 10),
      placesOffertes: data.placesOffertes,
      label: data.label?.trim() || undefined,
      active: data.active !== false,
      formateurs: toRelationIds(data.formateurIds),
      intervenants: toRelationIds(data.intervenantIds),
    },
    overrideAccess: true,
  });
  return {
    id: created.id,
    formationSlug: formation.slug ? String(formation.slug) : null,
  };
}

export async function readFormationSessionForUpdate(sessionId: number | string): Promise<{
  enrolledCount: number;
  lockedFormationId: string;
  formationSlug: string | null;
}> {
  const payload = await getPayloadClient();
  const enrolledCount = await countEnrolledForSession(sessionId);
  const existing = await payload.findByID({
    collection: "formation-sessions",
    id: sessionId,
    depth: 0,
    overrideAccess: true,
  });
  const lockedFormationId = relationId(existing.formation);
  const formation = await payload.findByID({
    collection: "formations",
    id: lockedFormationId,
    depth: 0,
    overrideAccess: true,
  });
  return {
    enrolledCount,
    lockedFormationId,
    formationSlug: formation.slug ? String(formation.slug) : null,
  };
}

export async function updateFormationSessionRecord(
  sessionId: number | string,
  data: FormationSessionWrite,
): Promise<void> {
  const payload = await getPayloadClient();
  await payload.update({
    collection: "formation-sessions",
    id: sessionId,
    data: {
      dateDebut: data.dateDebut.slice(0, 10),
      dateFin: data.dateFin.slice(0, 10),
      placesOffertes: data.placesOffertes,
      label: data.label?.trim() || null,
      active: data.active !== false,
      formateurs: toRelationIds(data.formateurIds),
      intervenants: toRelationIds(data.intervenantIds),
    },
    overrideAccess: true,
  });
}

export async function deleteFormationSessionRecord(
  sessionId: number | string,
): Promise<{ blocked: true } | { blocked: false; formationSlug: string | null }> {
  if ((await countEnrolledForSession(sessionId)) > 0) {
    return { blocked: true };
  }
  const payload = await getPayloadClient();
  const existing = await payload.findByID({
    collection: "formation-sessions",
    id: sessionId,
    depth: 1,
    overrideAccess: true,
  });
  const formationSlug =
    typeof existing.formation === "object" && existing.formation
      ? String((existing.formation as { slug?: string }).slug ?? "")
      : null;
  const leftovers = await payload.find({
    collection: "inscriptions",
    where: { session: { equals: sessionId } },
    limit: 200,
    depth: 0,
    overrideAccess: true,
  });
  for (const doc of leftovers.docs) {
    await payload.delete({
      collection: "inscriptions",
      id: doc.id,
      overrideAccess: true,
    });
  }
  await payload.delete({
    collection: "formation-sessions",
    id: sessionId,
    overrideAccess: true,
  });
  return { blocked: false, formationSlug: formationSlug || null };
}

export async function listFormationOptions(): Promise<FormationOption[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "formations",
    limit: 200,
    sort: "titre",
    depth: 0,
    overrideAccess: true,
  });
  return result.docs.map((doc) => ({
    id: doc.id,
    titre: String(doc.titre ?? doc.titreCourt ?? doc.slug),
    slug: String(doc.slug),
    tarifEuros:
      typeof doc.tarifEuros === "number" && doc.tarifEuros > 0 ? doc.tarifEuros : null,
    tarif: doc.tarif ? String(doc.tarif) : null,
  }));
}

export async function listSessionStaffOptions(): Promise<SessionStaffOption[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "users",
    limit: 500,
    sort: "email",
    depth: 0,
    overrideAccess: true,
  });
  const rows: SessionStaffOption[] = [];
  for (const doc of result.docs) {
    const clerkId = typeof doc.clerkId === "string" ? doc.clerkId.trim() : "";
    if (!clerkId) continue;
    const role = doc.role === "formateur" || doc.role === "intervenant" ? doc.role : null;
    if (!role) continue;
    const email = typeof doc.email === "string" ? doc.email.trim() : "";
    if (!email) continue;
    const nom = typeof doc.name === "string" && doc.name.trim() ? doc.name.trim() : email;
    rows.push({ id: doc.id, nom, email, role });
  }
  return rows.sort((a, b) => a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" }));
}
