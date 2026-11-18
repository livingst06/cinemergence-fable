"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  deleteHorsProcessPaiement,
  insertHorsProcessPaiement,
} from "@/lib/paiements-hors-process";
import { normalizePayerEmail } from "@/lib/payer-user";
import { requireAdmin } from "@/lib/session-profile";

const schema = z.object({
  payerName: z.string().trim().max(120).optional().default(""),
  payerEmail: z.string().trim().max(200).optional().default(""),
  amountEuros: z.number().positive("Montant invalide").max(100_000),
  paidAtLocal: z.string().trim().min(1, "Date invalide"),
  sessionId: z.number().int().positive(),
});

export type HorsProcessInput = z.infer<typeof schema>;

export async function createHorsProcessPaiementAction(
  input: HorsProcessInput,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }
  if (parsed.data.payerEmail && !normalizePayerEmail(parsed.data.payerEmail)) {
    return { ok: false, error: "E-mail invalide." };
  }

  const amountCents = Math.round(parsed.data.amountEuros * 100);
  const result = await insertHorsProcessPaiement({
    payerName: parsed.data.payerName || null,
    payerEmail: parsed.data.payerEmail || null,
    amountCents,
    paidAtLocal: parsed.data.paidAtLocal,
    sessionId: parsed.data.sessionId,
  });
  if (!result.ok) return result;

  revalidateHorsProcessPaths();
  return { ok: true, message: "Paiement hors process enregistré." };
}

function revalidateHorsProcessPaths() {
  revalidatePath("/les-paiements");
  revalidatePath("/les-sessions");
  revalidatePath("/formations");
  revalidatePath("/formations/kheiron");
}

export async function deleteHorsProcessPaiementAction(
  id: number,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Paiement introuvable." };
  const deleted = await deleteHorsProcessPaiement(id);
  if (!deleted) return { ok: false, error: "Paiement introuvable." };
  revalidateHorsProcessPaths();
  return { ok: true, message: "Paiement hors process supprimé." };
}
