import { isUserRole, type UserRole } from "@/lib/user-roles";

/** Longueur max d’un message de salon (Payload + formulaire). */
export const SALON_POST_MAX_LENGTH = 2000;

export type SalonPostView = {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  authorFirstName: string;
  authorRole: UserRole;
  authorAvatarKey: string | null;
  createdAt: string;
};

export const SALON_STAFF_ROLE_LABEL: Record<
  Exclude<UserRole, "eleve">,
  string
> = {
  admin: "Admin",
  formateur: "Formateur",
  intervenant: "Intervenant",
};

export function isSalonStaffRole(
  role: UserRole,
): role is Exclude<UserRole, "eleve"> {
  return role !== "eleve";
}

export function staffRoleBadgeClass(role: Exclude<UserRole, "eleve">): string {
  if (role === "admin") return "bg-amber-400/15 text-amber-300";
  if (role === "formateur") return "bg-convert/15 text-convert-light";
  return "bg-white/10 text-projector-light";
}

export function splitPersonName(name: string): {
  firstName: string;
  lastName: string;
} {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function salonAuthorRole(value: unknown): UserRole {
  return isUserRole(value) ? value : "eleve";
}

