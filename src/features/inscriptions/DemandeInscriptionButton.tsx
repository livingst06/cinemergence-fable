"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { startCheckout } from "@/features/inscriptions/checkout-actions";
import { cn } from "@/lib/utils";

type DemandeInscriptionButtonProps = {
  sessionId: number | string | undefined;
  placesRestantes: number | null;
  alreadyRequested?: boolean;
  checkoutPending?: boolean;
  pendingInscriptionId?: string | null;
  formationSlug: string;
  /** false si tarifEuros absent */
  paymentEnabled?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
};

export function DemandeInscriptionButton({
  sessionId,
  placesRestantes,
  alreadyRequested,
  checkoutPending,
  pendingInscriptionId,
  formationSlug,
  paymentEnabled = true,
  className,
  size = "lg",
}: DemandeInscriptionButtonProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (checkoutPending && pendingInscriptionId) {
    return (
      <ButtonLink
        href={`/paiement/${pendingInscriptionId}`}
        size={size}
        className={cn("btn-convert", className)}
      >
        Finaliser le paiement
      </ButtonLink>
    );
  }

  if (alreadyRequested) {
    return (
      <Button
        type="button"
        size={size}
        className={cn("btn-convert", className)}
        disabled
      >
        Vous êtes déjà inscrit
      </Button>
    );
  }

  if (placesRestantes != null && placesRestantes <= 0) {
    return (
      <Button type="button" size={size} className={cn("btn-convert", className)} disabled>
        Complet
      </Button>
    );
  }

  if (!sessionId || !paymentEnabled) {
    return (
      <Button
        type="button"
        size={size}
        className={cn("btn-convert", className)}
        onClick={() =>
          toast.error(
            !sessionId
              ? "Cette session n’est pas encore ouverte au paiement en ligne."
              : "Tarif de paiement non configuré pour cette formation.",
          )
        }
      >
        Je réserve
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <ButtonLink
        href={`/sign-in?redirect_url=${encodeURIComponent(`/formations/${formationSlug}`)}`}
        size={size}
        className={cn("btn-convert", className)}
      >
        Je réserve
      </ButtonLink>
    );
  }

  return (
    <Button
      type="button"
      size={size}
      className={cn("btn-convert", className)}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await startCheckout(sessionId);
          if (!result.ok) {
            if (result.code === "auth") {
              router.push(
                `/sign-in?redirect_url=${encodeURIComponent(`/formations/${formationSlug}`)}`,
              );
              return;
            }
            if (result.code === "duplicate") {
              toast.message(result.error);
              router.refresh();
              return;
            }
            toast.error(result.error);
            router.refresh();
            return;
          }
          router.push(`/paiement/${result.inscriptionId}`);
          router.refresh();
        });
      }}
    >
      {pending ? "Réservation…" : "Je réserve"}
    </Button>
  );
}
