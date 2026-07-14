"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * Remplace le bouton de déconnexion natif de Payload : la session étant
 * gérée par Clerk (voir src/lib/clerk-strategy.ts), on ferme la session Clerk
 * puis on renvoie vers l'accueil du site.
 */
export function LogoutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="nav__log-out"
      aria-label="Déconnexion"
      title="Déconnexion"
    >
      <svg
        className="icon icon--logout"
        fill="none"
        height="20"
        viewBox="0 0 20 20"
        width="20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="stroke"
          d="M12 16H14.6667C15.0203 16 15.3594 15.8595 15.6095 15.6095C15.8595 15.3594 16 15.0203 16 14.6667V5.33333C16 4.97971 15.8595 4.64057 15.6095 4.39052C15.3594 4.14048 15.0203 4 14.6667 4H12M7.33333 13.3333L4 10M4 10L7.33333 6.66667M4 10H12"
          strokeLinecap="square"
        />
      </svg>
    </button>
  );
}
