import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import {
  AdminDemandesPanel,
  type AdminSessionGroup,
} from "@/features/inscriptions/AdminDemandesPanel";
import { normalizeInscriptionStatus } from "@/lib/inscription-status";
import { getPayloadClient } from "@/lib/payload";
import { getSessionProfile } from "@/lib/session-profile";

export const metadata: Metadata = {
  title: "Les sessions",
  robots: { index: false, follow: false },
};

function isEnrolled(status: string): boolean {
  const s = normalizeInscriptionStatus(status);
  return s === "payee" || s === "validee" || s === "inscrit";
}

async function getSessionsWithInscriptions(): Promise<AdminSessionGroup[]> {
  try {
    const payload = await getPayloadClient();
    const instances = await payload.find({
      collection: "formation-instances",
      depth: 1,
      limit: 200,
      sort: "dateDebut",
      overrideAccess: true,
    });

    const groups: AdminSessionGroup[] = [];

    for (const inst of instances.docs) {
      const formation =
        typeof inst.formation === "object" && inst.formation
          ? (inst.formation as {
              titre?: string;
              titreCourt?: string;
              slug?: string;
            })
          : null;
      if (!formation?.slug) continue;

      const inscriptions = await payload.find({
        collection: "inscriptions",
        where: { instance: { equals: inst.id } },
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

      if (!trainees.some((t) => isEnrolled(t.status))) continue;

      groups.push({
        instanceId: inst.id,
        label: inst.label ? String(inst.label) : null,
        formationTitre: String(
          formation.titre ?? formation.titreCourt ?? formation.slug,
        ),
        formationSlug: String(formation.slug),
        dateDebut: String(inst.dateDebut),
        dateFin: String(inst.dateFin),
        placesOffertes:
          typeof inst.placesOffertes === "number" ? inst.placesOffertes : 0,
        active: inst.active !== false,
        trainees,
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

  const sessions = await getSessionsWithInscriptions();

  return (
    <>
      <PageHero eyebrow="Administration" title="Les sessions" />
      <Section>
        <div className="container-page max-w-4xl">
          <p className="mb-8 text-sm text-muted-text text-pretty">
            Sessions avec au moins un stagiaire inscrit. Déroulez une session
            pour voir la liste. Un paiement Stripe confirme la place
            automatiquement.
          </p>
          <AdminDemandesPanel sessions={sessions} />
        </div>
      </Section>
    </>
  );
}
