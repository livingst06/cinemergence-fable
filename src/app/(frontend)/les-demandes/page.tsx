import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import {
  AdminDemandesPanel,
  type AdminDemandeRow,
} from "@/features/inscriptions/AdminDemandesPanel";
import { getPayloadClient } from "@/lib/payload";
import { getSessionProfile } from "@/lib/session-profile";

export const metadata: Metadata = {
  title: "Les demandes",
  robots: { index: false, follow: false },
};

async function getAllDemandes(): Promise<AdminDemandeRow[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "inscriptions",
      depth: 1,
      limit: 200,
      sort: "-updatedAt",
      overrideAccess: true,
    });

    const rows: AdminDemandeRow[] = [];
    for (const doc of result.docs) {
      const formation = doc.formation;
      const user = doc.user;
      if (!formation || typeof formation !== "object") continue;
      if (!user || typeof user !== "object") continue;

      const f = formation as {
        titre?: string;
        titreCourt?: string;
        slug?: string;
      };
      const u = user as { email?: string; name?: string };
      if (!f.slug) continue;

      rows.push({
        id: doc.id,
        status: String(doc.status),
        commentaireAdmin: doc.commentaireAdmin
          ? String(doc.commentaireAdmin)
          : null,
        message: doc.message ? String(doc.message) : null,
        updatedAt: doc.updatedAt ? String(doc.updatedAt) : undefined,
        userEmail: String(u.email ?? "—"),
        userName: String(u.name ?? ""),
        formationTitre: String(f.titre ?? f.titreCourt ?? f.slug),
        formationSlug: String(f.slug),
      });
    }
    return rows;
  } catch {
    return [];
  }
}

export default async function LesDemandesPage() {
  const profile = await getSessionProfile();
  if (!profile.clerkUser) {
    redirect("/sign-in?redirect_url=/les-demandes");
  }
  if (!profile.isAdminEligible) {
    redirect("/");
  }

  const rows = await getAllDemandes();

  return (
    <>
      <PageHero eyebrow="Administration" title="Les demandes" />
      <Section>
        <div className="container-page max-w-4xl">
          <p className="mb-8 text-sm text-muted-text text-pretty">
            Validez, refusez ou demandez des pièces complémentaires. La
            validation consomme une place sur la session.
          </p>
          <AdminDemandesPanel rows={rows} />
        </div>
      </Section>
    </>
  );
}
