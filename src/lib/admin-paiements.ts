import "server-only";

import { formatFormationSessionLabel } from "@/lib/inscription-status";
import { listAllHorsProcess } from "@/lib/paiements-hors-process";
import { listAllPaiements } from "@/lib/paiements";
import { splitEleveName, type AdminPaiementRow } from "@/lib/paiement-status";

const UNKNOWN_NAME = "Inconnu";
const UNKNOWN_EMAIL = "inconnu";

function sessionLabelOf(paiement: {
  sessionLabel: string | null;
  sessionDateDebut: string | null;
  sessionDateFin: string | null;
}): string | null {
  return (
    paiement.sessionLabel ||
    formatFormationSessionLabel(
      paiement.sessionDateDebut ?? undefined,
      paiement.sessionDateFin ?? undefined,
      { month: "long" },
    )
  );
}

/** Admin : encaissements Stripe et paiements hors process. */
export async function listAdminPaiements(): Promise<AdminPaiementRow[]> {
  try {
    const [paiements, horsProcess] = await Promise.all([
      listAllPaiements(),
      listAllHorsProcess(),
    ]);
    const stripeRows: AdminPaiementRow[] = paiements.map((paiement) => {
      const { prenom, nom } = splitEleveName(paiement.payerName);
      return {
        id: paiement.checkoutSessionId,
        inscriptionId: null,
        elevePrenom: prenom,
        eleveNom: nom,
        eleveEmail: paiement.payerEmail ?? "—",
        formationTitre: paiement.formationTitre || paiement.formationSlug,
        formationSlug: paiement.formationSlug,
        sessionLabel: sessionLabelOf(paiement),
        amountEuros: paiement.amountEuros,
        paidAt: paiement.paidAt,
        status: "paye",
        canal: "stripe",
      };
    });
    const horsRows: AdminPaiementRow[] = horsProcess.map((paiement) => {
      const { prenom, nom } = splitEleveName(paiement.payerName || UNKNOWN_NAME);
      return {
        id: `hors:${paiement.id}`,
        inscriptionId: null,
        elevePrenom: prenom || UNKNOWN_NAME,
        eleveNom: nom,
        eleveEmail: paiement.payerEmail?.trim() || UNKNOWN_EMAIL,
        formationTitre: paiement.formationTitre || paiement.formationSlug,
        formationSlug: paiement.formationSlug,
        sessionLabel: sessionLabelOf(paiement),
        amountEuros: paiement.amountEuros,
        paidAt: paiement.paidAt,
        status: "paye",
        canal: "hors_process",
      };
    });
    return [...stripeRows, ...horsRows];
  } catch (error) {
    console.error("[listAdminPaiements]", error);
    return [];
  }
}
