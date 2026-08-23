import "server-only";

import { getPayloadClient } from "@/lib/payload";
import { ensureSalonForSession } from "@/lib/session-salon";
import { ensureSessionStaffUsersRels } from "@/lib/session-staff-schema";
import {
  mapStaffPeople,
  sessionMatchesStaff,
  type StaffKind,
} from "@/lib/staff-session-match";

export type { StaffKind };
export { sessionMatchesStaff };

export type StaffSessionRow = {
  id: string;
  formationTitre: string;
  formationSlug: string;
  dateDebut: string;
  dateFin: string;
  salonId?: string;
};

/** Sessions où ce compte users est assigné comme formateur ou intervenant. */
export async function listSessionsForStaff(
  userId: number | string | null,
  emails: readonly string[],
  kind: StaffKind,
): Promise<StaffSessionRow[]> {
  try {
    const payload = await getPayloadClient();
    await ensureSessionStaffUsersRels(payload);
    const sessions = await payload.find({
      collection: "formation-sessions",
      depth: 1,
      limit: 200,
      sort: "dateDebut",
      overrideAccess: true,
    });

    const staffIds = new Set(
      userId != null && String(userId).trim() ? [String(userId)] : [],
    );

    const rows: StaffSessionRow[] = [];
    for (const session of sessions.docs) {
      const formateurs = mapStaffPeople(
        (session as { formateurs?: unknown }).formateurs,
      );
      const intervenants = mapStaffPeople(
        (session as { intervenants?: unknown }).intervenants,
      );
      if (
        !sessionMatchesStaff(
          { formateurs, intervenants },
          staffIds,
          emails,
          kind,
        )
      ) {
        continue;
      }

      const formation =
        typeof session.formation === "object" && session.formation
          ? (session.formation as {
              titre?: string;
              titreCourt?: string;
              slug?: string;
            })
          : null;
      if (!formation?.slug) continue;

      let salonId: string | undefined;
      try {
        const salon = await ensureSalonForSession(payload, session.id);
        if (salon) salonId = String(salon.id);
      } catch (error) {
        console.error("[staff-sessions] salon", session.id, error);
      }

      rows.push({
        id: String(session.id),
        formationTitre: String(
          formation.titre ?? formation.titreCourt ?? formation.slug,
        ),
        formationSlug: String(formation.slug),
        dateDebut: String(session.dateDebut ?? ""),
        dateFin: String(session.dateFin ?? ""),
        salonId,
      });
    }
    return rows;
  } catch {
    return [];
  }
}
