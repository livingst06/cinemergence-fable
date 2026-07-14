import type { Metadata } from "next";
import { SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
};

export default async function MonComptePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/mon-compte");
  }

  const prenom = user.firstName || user.username || user.emailAddresses[0]?.emailAddress || "";

  return (
    <>
      <PageHero eyebrow="Espace membre" title="Mon compte" />
      <Section>
        <div className="container-page max-w-2xl">
          <div className="card-stage p-8">
            <p className="text-lg text-cream">
              Bonjour <span className="text-or-light">{prenom}</span> 👋
            </p>
            <p className="mt-2 text-sm text-muted-text">
              {user.emailAddresses[0]?.emailAddress}
            </p>
            <div className="mt-8">
              <SignOutButton redirectUrl="/">
                <Button variant="outline" type="button">
                  Se déconnecter
                </Button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
