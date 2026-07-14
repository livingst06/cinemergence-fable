import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <>
      <PageHero
        eyebrow="Espace membre"
        title="Connexion"
        description="Accède à ton espace Cinémergence."
      />
      <Section>
        <div className="container-page flex justify-center">
          <SignIn />
        </div>
      </Section>
    </>
  );
}
