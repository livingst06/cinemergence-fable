import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LesSessionsAdmin } from "@/features/formations/LesSessionsAdmin";
import {
  listFormationsForSessionSelect,
  listIntervenantsForSessionSelect,
} from "@/features/formations/session-actions";
import type {
  AdminSessionGroup,
  AdminSessionStaff,
} from "@/features/inscriptions/AdminDemandesPanel";
import { getPayloadClient } from "@/lib/payload";
import { getSessionProfile } from "@/lib/session-profile";

export const metadata: Metadata = {
  title: "Les sessions",
  robots: { index: false, follow: false },
};

function mapStaff(raw: unknown): AdminSessionStaff[] {
  if (!Array.isArray(raw)) return [];
  const out: AdminSessionStaff[] = [];
  for (const item of raw) {
    if (typeof item === "object" && item && "id" in item) {
      const doc = item as {
        id: number | string;
        nom?: string;
        role?: string;
        slug?: string;
      };
      out.push({
        id: doc.id,
        nom: String(doc.nom ?? ""),
        role: String(doc.role ?? ""),
        slug: String(doc.slug ?? ""),
      });
      continue;
    }
    if (typeof item === "number" || typeof item === "string") {
      out.push({ id: item, nom: "", role: "", slug: "" });
    }
  }
  return out.filter((p) => p.nom || p.slug);
}

async function getAllSessions(): Promise<AdminSessionGroup[]> {
  try {
    const payload = await getPayloadClient();
    const sessions = await payload.find({
      collection: "formation-sessions",
      depth: 1,
      limit: 200,
      sort: "dateDebut",
      overrideAccess: true,
    });

    const groups: AdminSessionGroup[] = [];

    for (const session of sessions.docs) {
      const formation =
        typeof session.formation === "object" && session.formation
          ? (session.formation as {
              id?: number | string;
              titre?: string;
              titreCourt?: string;
              slug?: string;
            })
          : null;
      if (!formation?.slug || formation.id == null) continue;

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

      groups.push({
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
          typeof session.placesOffertes === "number" ? session.placesOffertes : 0,
        tarifEuros:
          typeof session.formation === "object" &&
          session.formation &&
          typeof (session.formation as { tarifEuros?: number }).tarifEuros ===
            "number"
            ? (session.formation as { tarifEuros: number }).tarifEuros
            : null,
        active: session.active !== false,
        trainees,
        formateurs: mapStaff(
          (session as { formateurs?: unknown }).formateurs,
        ),
        intervenants: mapStaff(
          (session as { intervenants?: unknown }).intervenants,
        ),
      });
    }

    return groups;
  } catch {
    return [];
  }
}

export default async function LesSessionsPage() {
  const profile = await getSessionProfile();
  if (!profile.clerkUser) {
    redirect("/sign-in?redirect_url=/les-sessions");
  }
  if (!profile.isAdminEligible) {
    redirect("/");
  }

  const [sessions, formations, intervenants] = await Promise.all([
    getAllSessions(),
    listFormationsForSessionSelect(),
    listIntervenantsForSessionSelect(),
  ]);

  return (
    <LesSessionsAdmin
      sessions={sessions}
      formations={formations}
      intervenants={intervenants}
    />
  );
}
