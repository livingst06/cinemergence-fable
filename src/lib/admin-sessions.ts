import "server-only";

import type {
  AdminSessionGroup,
  AdminSessionStaff,
} from "@/features/inscriptions/AdminDemandesPanel";
import { getIntervenants } from "@/lib/data";
import { getPayloadClient } from "@/lib/payload";
import { ensureSessionStaffUsersRels } from "@/lib/session-staff-schema";

type PortraitIndex = {
  bySlug: Map<string, string>;
  byName: Map<string, string>;
};

function personKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function portraitUrlFor(
  doc: { name?: string | null; email?: string | null; clerkId?: string | null },
  email: string | null,
  index: PortraitIndex,
): string | null {
  const clerkId = typeof doc.clerkId === "string" ? doc.clerkId.trim() : "";
  if (clerkId.startsWith("fiche:")) {
    const fromSlug = index.bySlug.get(clerkId.slice("fiche:".length));
    if (fromSlug) return fromSlug;
  }
  const nom = staffDisplayName(doc.name, email);
  if (!nom) return null;
  return index.byName.get(personKey(nom)) ?? null;
}

function staffDisplayName(
  name: string | null | undefined,
  email: string | null,
): string {
  const trimmed = name?.trim() ?? "";
  if (trimmed) return trimmed;
  return email?.trim() || "";
}

function mapStaff(raw: unknown, portraits: PortraitIndex): AdminSessionStaff[] {
  if (!Array.isArray(raw)) return [];
  const out: AdminSessionStaff[] = [];
  for (const item of raw) {
    if (typeof item === "object" && item && "id" in item) {
      const doc = item as {
        id: number | string;
        name?: string | null;
        email?: string | null;
        clerkId?: string | null;
      };
      const email =
        typeof doc.email === "string" && doc.email.trim()
          ? doc.email.trim()
          : null;
      const nom = staffDisplayName(doc.name, email);
      if (!nom && !email) continue;
      out.push({
        id: doc.id,
        nom: nom || email || "",
        email,
        photoUrl: portraitUrlFor(doc, email, portraits),
      });
      continue;
    }
    if (typeof item === "number" || typeof item === "string") {
      out.push({ id: item, nom: "", email: null, photoUrl: null });
    }
  }
  return out.filter((p) => p.nom || p.email);
}

/** Admin: toutes les sessions avec élèves + staff. */
export async function listAdminSessionGroups(): Promise<AdminSessionGroup[]> {
  try {
    const payload = await getPayloadClient();
    await ensureSessionStaffUsersRels(payload);
    const intervenants = await getIntervenants();
    const portraits: PortraitIndex = { bySlug: new Map(), byName: new Map() };
    for (const person of intervenants) {
      if (!person.photoUrl) continue;
      portraits.bySlug.set(person.slug, person.photoUrl);
      portraits.byName.set(personKey(person.nom), person.photoUrl);
    }

    const sessions = await payload.find({
      collection: "formation-sessions",
      depth: 1,
      limit: 200,
      sort: "dateDebut",
      overrideAccess: true,
    });

    const enriched = await Promise.all(
      sessions.docs.map(async (session) => {
        const formation =
          typeof session.formation === "object" && session.formation
            ? (session.formation as {
                id?: number | string;
                titre?: string;
                titreCourt?: string;
                slug?: string;
                tarifEuros?: number;
              })
            : null;
        if (!formation?.slug || formation.id == null) return null;

        const inscriptions = await payload.find({
          collection: "inscriptions",
          where: { session: { equals: session.id } },
          depth: 1,
          limit: 200,
          sort: "-updatedAt",
          overrideAccess: true,
        });

        const trainees: AdminSessionGroup["trainees"] = [];
        for (const doc of inscriptions.docs) {
          const user =
            typeof doc.user === "object" && doc.user
              ? (doc.user as { email?: string; name?: string })
              : null;
          if (!user) continue;
          trainees.push({
            id: doc.id,
            userName: String(user.name ?? ""),
            userEmail: String(user.email ?? "—"),
            status: String(doc.status),
            amountEuros:
              typeof doc.amountEuros === "number" ? doc.amountEuros : null,
          });
        }

        return {
          sessionId: session.id,
          formationId: formation.id,
          label: session.label ? String(session.label) : null,
          formationTitre: String(
            formation.titre ?? formation.titreCourt ?? formation.slug,
          ),
          formationSlug: String(formation.slug),
          dateDebut: String(session.dateDebut),
          dateFin: String(session.dateFin),
          placesOffertes:
            typeof session.placesOffertes === "number"
              ? session.placesOffertes
              : 0,
          tarifEuros:
            typeof formation.tarifEuros === "number"
              ? formation.tarifEuros
              : null,
          active: session.active !== false,
          trainees,
          formateurs: mapStaff(
            (session as { formateurs?: unknown }).formateurs,
            portraits,
          ),
          intervenants: mapStaff(
            (session as { intervenants?: unknown }).intervenants,
            portraits,
          ),
        } satisfies AdminSessionGroup;
      }),
    );

    return enriched.filter((g): g is AdminSessionGroup => g != null);
  } catch {
    return [];
  }
}
