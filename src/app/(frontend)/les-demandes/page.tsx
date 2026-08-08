import { redirect } from "next/navigation";

/** Ancienne URL — renommée en /les-sessions. */
export default function LesDemandesRedirect() {
  redirect("/les-sessions");
}
