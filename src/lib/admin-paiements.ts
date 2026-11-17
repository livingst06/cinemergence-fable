import "server-only";

import { formatFormationSessionLabel } from "@/lib/inscription-status";
import { listAllPaiements } from "@/lib/paiements";
import { splitEleveName, type AdminPaiementRow } from "@/lib/paiement-status";

/** Admin : les paiements enregistrés par le webhook Stripe. */
export async function listAdminPaiements(): Promise<AdminPaiementRow[]> {
  try {
    const paiements = await listAllPaiements();
    return paiements.map((paiement) => {
      const { prenom, nom } = splitEleveName(paiement.payerName);
      return {
        id: paiement.checkoutSessionId,
        inscriptionId: null,
        elevePrenom: prenom,
        eleveNom: nom,
        eleveEmail: paiement.payerEmail ?? "—",
        formationTitre: paiement.formationTitre || paiement.formationSlug,
        formationSlug: paiement.formationSlug,
        sessionLabel:
          paiement.sessionLabel ||
          formatFormationSessionLabel(
            paiement.sessionDateDebut ?? undefined,
            paiement.sessionDateFin ?? undefined,
            { month: "long" },
          ),
        amountEuros: paiement.amountEuros,
        paidAt: paiement.paidAt,
        status: "paye",
      };
    });
  } catch (error) {
    console.error("[listAdminPaiements]", error);
    return [];
  }
}
