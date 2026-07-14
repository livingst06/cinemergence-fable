import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Créer un compte",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <>
      <PageHero
        eyebrow="Espace membre"
        title="Créer un compte"
        description="Rejoins Cinémergence pour suivre tes formations."
      />
      <Section>
        <div className="container-page flex justify-center">
          <SignUp />
        </div>
      </Section>
    </>
  );
}
