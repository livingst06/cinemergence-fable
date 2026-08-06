"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { createInscriptionDemande } from "@/features/inscriptions/actions";
import { cn } from "@/lib/utils";

type DemandeInscriptionButtonProps = {
  formationId: number | string | undefined;
  placesRestantes: number | null;
  alreadyRequested?: boolean;
  formationSlug: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
};

export function DemandeInscriptionButton({
  formationId,
  placesRestantes,
  alreadyRequested,
  formationSlug,
  className,
  size = "lg",
}: DemandeInscriptionButtonProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!formationId) {
    return (
      <ButtonLink
        href={`/contact?formation=${formationSlug}&type=inscription`}
        size={size}
        className={cn("btn-cta", className)}
      >
        Je demande mon inscription
      </ButtonLink>
    );
  }

  if (!isSignedIn) {
    return (
      <ButtonLink
        href={`/sign-in?redirect_url=${encodeURIComponent(`/formations/${formationSlug}`)}`}
        size={size}
        className={cn("btn-cta", className)}
      >
        Je demande mon inscription
      </ButtonLink>
    );
  }

  if (alreadyRequested) {
    return (
      <ButtonLink
        href="/mes-reservations"
        size={size}
        className={cn("btn-outline-warm rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wider", className)}
      >
        Voir ma demande
      </ButtonLink>
    );
  }

  if (placesRestantes != null && placesRestantes <= 0) {
    return (
      <Button type="button" size={size} className={cn("btn-cta", className)} disabled>
        Complet
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size={size}
      className={cn("btn-cta", className)}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await createInscriptionDemande(formationId);
          if (!result.ok) {
            if (result.code === "auth") {
              router.push(
                `/sign-in?redirect_url=${encodeURIComponent(`/formations/${formationSlug}`)}`,
              );
              return;
            }
            toast.error(result.error);
            return;
          }
          toast.success(result.message);
          router.push("/mes-reservations");
          router.refresh();
        });
      }}
    >
      {pending ? "Envoi…" : "Je demande mon inscription"}
    </Button>
  );
}
