import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import {
  AdminDemandesPanel,
  type AdminSessionGroup,
} from "@/features/inscriptions/AdminDemandesPanel";

type StaffSessionsScreenProps = {
  eyebrow: string;
  title: string;
  sessions: AdminSessionGroup[];
};

export function StaffSessionsScreen({
  eyebrow,
  title,
  sessions,
}: StaffSessionsScreenProps) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} />
      <Section>
        <div className="container-page max-w-4xl">
          <AdminDemandesPanel sessions={sessions} />
        </div>
      </Section>
    </>
  );
}
