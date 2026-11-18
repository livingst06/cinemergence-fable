"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createHorsProcessPaiementAction } from "@/features/inscriptions/hors-process-actions";

export type HorsProcessSessionChoice = {
  id: number;
  formationTitre: string;
  formationSlug: string;
  sessionLabel: string;
};

const fieldClass =
  "border-border bg-noir-tertiary/60 text-cream placeholder:text-muted-text";

function nowParisLocal(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${read("year")}-${read("month")}-${read("day")}T${read("hour")}:${read("minute")}`;
}

type HorsProcessPaiementDialogProps = {
  open: boolean;
  sessions: HorsProcessSessionChoice[];
  onClose: () => void;
  onSaved: () => void;
};

export function HorsProcessPaiementDialog({
  open,
  sessions,
  onClose,
  onSaved,
}: HorsProcessPaiementDialogProps) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setAmount("");
    setPaidAt(nowParisLocal());
    setSessionId(sessions[0] ? String(sessions[0].id) : "");
  }, [open, sessions]);

  if (!open) return null;

  const save = () => {
    const euros = Number(amount.replace(",", "."));
    startTransition(async () => {
      const result = await createHorsProcessPaiementAction({
        payerName: name,
        payerEmail: email,
        amountEuros: euros,
        paidAtLocal: paidAt,
        sessionId: Number(sessionId),
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      onSaved();
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-start justify-center overflow-y-auto bg-noir/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hors-process-title"
    >
      <div className="my-8 w-full max-w-lg rounded-2xl border border-border bg-noir-secondary p-6 shadow-2xl">
        <h2 id="hors-process-title" className="font-heading text-2xl text-cream">
          Ajouter un paiement hors process
        </h2>
        <p className="mt-2 text-sm text-muted-text">
          Virement ou espèces. Le nom et l’e-mail peuvent rester vides.
        </p>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hors-name">Nom</Label>
            <Input
              id="hors-name"
              className={fieldClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hors-email">E-mail</Label>
            <Input
              id="hors-email"
              type="email"
              className={fieldClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hors-amount">Montant (€)</Label>
            <Input
              id="hors-amount"
              inputMode="decimal"
              className={fieldClass}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hors-date">Date et heure</Label>
            <Input
              id="hors-date"
              type="datetime-local"
              className={fieldClass}
              value={paidAt}
              onChange={(event) => setPaidAt(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hors-session">Session</Label>
            <select
              id="hors-session"
              className="h-11 w-full rounded-lg border border-border bg-noir-tertiary/60 px-3 text-sm text-cream disabled:opacity-60"
              value={sessionId}
              disabled={pending || sessions.length === 0}
              onChange={(event) => setSessionId(event.target.value)}
            >
              {sessions.length === 0 ? (
                <option value="">Aucune session</option>
              ) : (
                sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.formationTitre} — {session.sessionLabel}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button
            type="button"
            className="btn-convert"
            onClick={save}
            disabled={pending || sessions.length === 0}
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
