import { notFound, redirect } from "next/navigation";

import { getFormationBySlug, getFormations } from "@/lib/data";
import { formationPath } from "@/lib/formation-types";

type Props = {
  params: Promise<{ slug: string }>;
};

/** Reserved static route segments that must not be treated as formation slugs. */
const RESERVED = new Set([
  "formations",
  "intervenants",
  "financement",
  "association",
  "galerie",
  "contact",
  "mentions-legales",
  "confidentialite",
  "cgv",
  "mon-compte",
  "mon-profil",
  "mes-sessions-formateur",
  "mes-sessions-intervenant",
  "sign-in",
  "sign-up",
  "api",
  "admin",
]);

export async function generateStaticParams() {
  const formations = await getFormations();
  return formations.map((f) => ({ slug: f.slug }));
}

export default async function LegacyFormationRedirect({ params }: Props) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const formation = await getFormationBySlug(slug);
  if (!formation) notFound();

  redirect(formationPath(slug));
}
