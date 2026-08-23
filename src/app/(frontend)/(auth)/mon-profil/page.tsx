import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { AvatarPicker } from "@/features/profile/AvatarPicker";
import { UserAvatar } from "@/features/profile/UserAvatar";
import { ensurePayloadUserForClerk } from "@/lib/ensure-payload-user";
import { isAvatarKey } from "@/lib/avatars";
import {
  isSalonStaffRole,
  SALON_STAFF_ROLE_LABEL,
  staffRoleBadgeClass,
} from "@/lib/salon-constants";
import { getSessionProfile } from "@/lib/session-profile";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mon profil",
  robots: { index: false, follow: false },
};

function displayOrDash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

export default async function MonProfilPage() {
  const profile = await getSessionProfile();
  if (!profile.clerkUser) {
    redirect("/sign-in?redirect_url=/mon-profil");
  }

  let avatarKey = isAvatarKey(profile.avatarKey) ? profile.avatarKey : null;
  if (!profile.payloadUserId) {
    const user = await ensurePayloadUserForClerk();
    const raw =
      user && typeof user === "object" && "avatarKey" in user
        ? (user as { avatarKey?: string | null }).avatarKey
        : null;
    if (isAvatarKey(raw)) avatarKey = raw;
  }

  const firstName = displayOrDash(profile.clerkUser.firstName);
  const lastName = displayOrDash(profile.clerkUser.lastName);
  const fullName = [profile.clerkUser.firstName, profile.clerkUser.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const staffRole =
    profile.role && isSalonStaffRole(profile.role) ? profile.role : null;

  return (
    <>
      <PageHero eyebrow="Espace membre" title="Mon profil" />
      <Section>
        <div className="container-page max-w-2xl space-y-8">
          <div className="card-stage flex items-center gap-4 p-6 md:p-8">
            <UserAvatar
              avatarKey={avatarKey}
              name={fullName || firstName}
              className="size-16 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm text-muted-text">Identité du compte</p>
              <div className="mt-1 flex flex-wrap items-center gap-2.5">
                <p className="font-heading text-2xl text-cream">
                  {fullName || "Profil"}
                </p>
                {staffRole ? (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                      staffRoleBadgeClass(staffRole),
                    )}
                  >
                    {SALON_STAFF_ROLE_LABEL[staffRole]}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="card-stage space-y-5 p-6 md:p-8">
            <h2 className="font-heading text-2xl text-cream">Tes informations</h2>
            <p className="text-sm text-muted-text">
              {staffRole
                ? "Prénom, nom et rôle sont lus depuis ton compte. Ils ne sont pas modifiables ici."
                : "Prénom et nom sont lus depuis ton compte. Ils ne sont pas modifiables ici."}
            </p>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-text">
                  Prénom
                </dt>
                <dd className="mt-1 rounded-xl border border-white/10 bg-noir-tertiary/60 px-4 py-3 text-cream">
                  {firstName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-text">
                  Nom
                </dt>
                <dd className="mt-1 rounded-xl border border-white/10 bg-noir-tertiary/60 px-4 py-3 text-cream">
                  {lastName}
                </dd>
              </div>
              {staffRole ? (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-text">
                    Rôle
                  </dt>
                  <dd className="mt-1 rounded-xl border border-white/10 bg-noir-tertiary/60 px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                        staffRoleBadgeClass(staffRole),
                      )}
                    >
                      {SALON_STAFF_ROLE_LABEL[staffRole]}
                    </span>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="card-stage space-y-5 p-6 md:p-8">
            <h2 className="font-heading text-2xl text-cream">Ton avatar</h2>
            <p className="text-sm text-muted-text">
              Choisis une illustration parmi la palette. Elle s’affichera dans le salon de discussion.
            </p>
            <AvatarPicker currentKey={avatarKey} />
          </div>
        </div>
      </Section>
    </>
  );
}
