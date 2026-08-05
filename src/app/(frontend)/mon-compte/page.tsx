import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { formationPath } from "@/lib/defaults";
import { getPayloadClient } from "@/lib/payload";
import { getSessionProfile } from "@/lib/session-profile";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
};

type InscritFormation = {
  id: number | string;
  titre: string;
  titreCourt: string;
  slug: string;
  status: string;
};

async function getInscriptionsInscrit(
  payloadUserId: number | string,
): Promise<InscritFormation[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "inscriptions",
      where: {
        and: [
          { user: { equals: payloadUserId } },
          { status: { equals: "inscrit" } },
        ],
      },
      depth: 1,
      limit: 50,
      sort: "-updatedAt",
      overrideAccess: true,
    });

    return result.docs
      .map((doc) => {
        const formation = doc.formation;
        if (!formation || typeof formation !== "object") return null;
        const f = formation as {
          id: number | string;
          titre?: string;
          titreCourt?: string;
          slug?: string;
        };
        if (!f.slug) return null;
        return {
          id: doc.id,
          titre: String(f.titre ?? f.titreCourt ?? f.slug),
          titreCourt: String(f.titreCourt ?? f.titre ?? f.slug),
          slug: String(f.slug),
          status: String(doc.status),
        };
      })
      .filter((row): row is InscritFormation => Boolean(row));
  } catch {
    return [];
  }
}

export default async function MonComptePage() {
  const profile = await getSessionProfile();

  if (!profile.clerkUser) {
    redirect("/sign-in?redirect_url=/mon-compte");
  }

  const user = profile.clerkUser;
  const prenom =
    user.firstName || user.username || profile.email || "";

  // S'assurer qu'un doc users existe (lazy) pour les prochaines inscriptions
  let payloadUserId = profile.payloadUserId;
  if (!payloadUserId && profile.email) {
    try {
      const payload = await getPayloadClient();
      const found = await payload.find({
        collection: "users",
        where: { clerkId: { equals: user.id } },
        limit: 1,
      });
      payloadUserId = found.docs[0]?.id ?? null;
      if (!payloadUserId) {
        const created = await payload.create({
          collection: "users",
          data: {
            email: profile.email,
            name: [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined,
            clerkId: user.id,
            role: profile.role ?? "stagiaire",
          },
          overrideAccess: true,
        });
        payloadUserId = created.id;
      }
    } catch {
      payloadUserId = null;
    }
  }

  const inscriptions = payloadUserId
    ? await getInscriptionsInscrit(payloadUserId)
    : [];

  return (
    <>
      <PageHero eyebrow="Espace membre" title="Mon compte" />
      <Section>
        <div className="container-page max-w-2xl space-y-8">
          <div className="card-stage p-8">
            <p className="text-lg text-cream">
              Bonjour <span className="text-or-light">{prenom}</span>
            </p>
            <p className="mt-2 text-sm text-muted-text">{profile.email}</p>
            {profile.isAdminEligible && (
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-or-light">
                Compte admin
              </p>
            )}
            <div className="mt-8">
              <SignOutButton redirectUrl="/">
                <Button variant="outline" type="button" className="btn-outline-warm">
                  Je me déconnecte
                </Button>
              </SignOutButton>
            </div>
          </div>

          <div className="card-stage p-8">
            <h2 className="font-heading text-2xl text-cream">Mes formations</h2>
            <p className="mt-2 text-sm text-muted-text text-pretty">
              Formations avec le statut « inscrit ». Les demandes en cours sont
              validées par l’équipe.
            </p>

            {inscriptions.length > 0 ? (
              <ul className="mt-6 space-y-3">
                {inscriptions.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-noir-tertiary/40 px-4 py-3"
                  >
                    <div>
                      <Link
                        href={formationPath(item.slug)}
                        className="font-medium text-cream hover:text-or-light"
                      >
                        {item.titreCourt}
                      </Link>
                      <p className="mt-0.5 text-xs uppercase tracking-wider text-projector-light">
                        Inscrit
                      </p>
                    </div>
                    <ButtonLink
                      href={formationPath(item.slug)}
                      size="sm"
                      variant="outline"
                      className="btn-outline-warm"
                    >
                      Je vois la fiche
                    </ButtonLink>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6 space-y-4">
                <p className="text-sm text-muted-text">
                  Aucune formation confirmée pour le moment.
                </p>
                <ButtonLink href="/contact?type=inscription" className="btn-cta">
                  Je demande une inscription
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
