"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cancelCheckoutHold } from "@/features/inscriptions/checkout-actions";

type CancelHoldButtonProps = {
  inscriptionId: string;
};

export function CancelHoldButton({ inscriptionId }: CancelHoldButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="lg"
      className="btn-outline-warm w-full justify-center rounded-lg px-6 py-3 text-sm font-semibold uppercase tracking-wider sm:w-auto sm:min-w-[14rem]"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await cancelCheckoutHold(inscriptionId);
          if (!result.ok) {
            if (result.code === "auth") {
              router.push(
                `/sign-in?redirect_url=${encodeURIComponent(`/paiement/${inscriptionId}`)}`,
              );
              return;
            }
            toast.error(result.error);
            return;
          }
          router.push("/paiement/annulation");
          router.refresh();
        });
      }}
    >
      {pending ? "Annulation…" : "Annuler et libérer ma place"}
    </Button>
  );
}
