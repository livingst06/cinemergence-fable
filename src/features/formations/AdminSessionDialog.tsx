"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createFormationSession,
  updateFormationSession,
  type FormationOption,
  type IntervenantOption,
} from "@/features/formations/session-actions";
import type { AdminSessionGroup } from "@/features/inscriptions/AdminDemandesPanel";
import { normalizeInscriptionStatus } from "@/lib/inscription-status";

const fieldClass =
  "border-border bg-noir-tertiary/60 text-cream placeholder:text-muted-text";

function toDateInputValue(value: string | undefined | null): string {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function countEnrolledTrainees(editing: AdminSessionGroup | null): number {
  if (!editing) return 0;
  return editing.trainees.filter((t) => {
    const s = normalizeInscriptionStatus(t.status);
    return s === "payee" || s === "validee" || s === "inscrit";
  }).length;
}

type AdminSessionDialogProps = {
  open: boolean;
  formations: FormationOption[];
  intervenants: IntervenantOption[];
  editing: AdminSessionGroup | null;
  onClose: () => void;
};

function toggleId(
  list: string[],
  id: string,
  checked: boolean,
): string[] {
  if (checked) {
    return list.includes(id) ? list : [...list, id];
  }
  return list.filter((x) => x !== id);
}

function StaffChecklist({
  title,
  options,
  selectedIds,
  onChange,
  emptyHint,
}: {
  title: string;
  options: IntervenantOption[];
  selectedIds: string[];
  onChange: (next: string[]) => void;
  emptyHint: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      {options.length === 0 ? (
        <p className="text-xs text-muted-text">{emptyHint}</p>
      ) : (
        <ul className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-border/70 bg-noir-tertiary/30 p-3">
          {options.map((opt) => {
            const id = String(opt.id);
            const checked = selectedIds.includes(id);
            return (
              <li key={id}>
                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-cream">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      onChange(toggleId(selectedIds, id, e.target.checked))
                    }
                    className="mt-0.5 size-4 shrink-0 rounded border-border"
                  />
                  <span className="min-w-0">
                    <span className="block font-medium">{opt.nom}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function AdminSessionDialog({
  open,
  formations,
  intervenants,
  editing,
  onClose,
}: AdminSessionDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(editing);
  const [formationId, setFormationId] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [placesOffertes, setPlacesOffertes] = useState("8");
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(true);
  const [formateurIds, setFormateurIds] = useState<string[]>([]);
  const [intervenantIds, setIntervenantIds] = useState<string[]>([]);

  const formateurOptions = useMemo(
    () => intervenants.filter((i) => i.categorie === "formateur"),
    [intervenants],
  );
  const intervenantOptions = useMemo(
    () => intervenants.filter((i) => i.categorie === "professionnel"),
    [intervenants],
  );

  useEffect(() => {
    if (!open) return;
    if (editing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional form hydrate
      setFormationId(String(editing.formationId));
      setDateDebut(toDateInputValue(editing.dateDebut));
      setDateFin(toDateInputValue(editing.dateFin));
      setPlacesOffertes(String(editing.placesOffertes || 8));
      setLabel(editing.label ?? "");
      setActive(editing.active);
      setFormateurIds(editing.formateurs.map((f) => String(f.id)));
      setIntervenantIds(editing.intervenants.map((i) => String(i.id)));
      return;
    }
    setFormationId(formations[0] ? String(formations[0].id) : "");
    setDateDebut("");
    setDateFin("");
    setPlacesOffertes("8");
    setLabel("");
    setActive(true);
    setFormateurIds([]);
    setIntervenantIds([]);
  }, [open, formations, editing]);

  const selectedFormation = useMemo(
    () => formations.find((f) => String(f.id) === String(formationId)) ?? null,
    [formations, formationId],
  );

  const inheritedTarifLabel = selectedFormation
    ? selectedFormation.tarif ??
      (selectedFormation.tarifEuros != null
        ? `${selectedFormation.tarifEuros.toLocaleString("fr-FR")} €`
        : null)
    : null;

  const enrolledMinPlaces = countEnrolledTrainees(editing);
  const placesMin = Math.max(1, enrolledMinPlaces);

  if (!open) return null;

  const submit = () => {
    if (!formationId) {
      toast.error("Choisissez une formation");
      return;
    }
    if (!selectedFormation?.tarifEuros) {
      toast.error(
        "Cette formation n’a pas de tarif. Fixez-le sur la fiche formation avant de créer une session.",
      );
      return;
    }
    const places = Number.parseInt(placesOffertes, 10);
    if (Number.isNaN(places) || places < 1) {
      toast.error("Nombre de places invalide");
      return;
    }
    if (isEdit && places < enrolledMinPlaces) {
      toast.error(
        `La capacité ne peut pas être inférieure aux ${enrolledMinPlaces} élève${enrolledMinPlaces > 1 ? "s" : ""} déjà inscrit${enrolledMinPlaces > 1 ? "s" : ""}.`,
      );
      return;
    }

    const payload = {
      formationId,
      dateDebut,
      dateFin,
      placesOffertes: places,
      label: label.trim() || null,
      active,
      formateurIds,
      intervenantIds,
    };

    startTransition(async () => {
      const result =
        isEdit && editing
          ? await updateFormationSession(editing.sessionId, payload)
          : await createFormationSession(payload);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      onClose();
      router.refresh();
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-start justify-center overflow-y-auto bg-noir/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-editor-title"
    >
      <div className="my-8 w-full max-w-lg rounded-2xl border border-border bg-noir-secondary p-6 shadow-2xl sm:p-8">
        <h2 id="session-editor-title" className="font-heading text-3xl text-cream">
          {isEdit ? "Modifier la session" : "Nouvelle session"}
        </h2>
        <p className="mt-2 text-sm text-muted-text">
          {isEdit
            ? "Mettez à jour les dates, places, formateurs et intervenants."
            : "Choisissez la formation, les dates, les places, puis cochez les formateurs et intervenants."}
        </p>

        <div className="mt-6 grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="s-formation">Formation</Label>
            <select
              id="s-formation"
              className={`flex h-9 w-full rounded-lg border px-3 text-sm ${fieldClass} disabled:cursor-not-allowed disabled:opacity-60`}
              value={formationId}
              onChange={(e) => setFormationId(e.target.value)}
              disabled={isEdit || formations.length === 0}
            >
              {formations.length === 0 ? (
                <option value="">Aucune formation</option>
              ) : (
                formations.map((f) => (
                  <option key={String(f.id)} value={String(f.id)}>
                    {f.titre}
                  </option>
                ))
              )}
            </select>
            {isEdit ? (
              <p className="text-xs text-muted-text">
                Non modifiable — la session reste liée à cette formation.
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-border/70 bg-noir-tertiary/40 px-4 py-3">
            <p className="label-copy">
              Tarif (formation)
            </p>
            <p className="mt-1 text-sm font-medium text-cream">
              {inheritedTarifLabel ?? "Aucun tarif sur cette formation"}
            </p>
            <p className="mt-1 text-xs text-muted-text">
              Non modifiable ici — changez-le sur la fiche formation.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="s-debut">Date de début</Label>
              <Input
                id="s-debut"
                type="date"
                className={fieldClass}
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-fin">Date de fin</Label>
              <Input
                id="s-fin"
                type="date"
                className={fieldClass}
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="s-places">Places max</Label>
            <Input
              id="s-places"
              type="number"
              min={placesMin}
              className={fieldClass}
              value={placesOffertes}
              onChange={(e) => setPlacesOffertes(e.target.value)}
            />
            {isEdit && enrolledMinPlaces > 0 ? (
              <p className="text-xs text-muted-text">
                Minimum {enrolledMinPlaces} (élève
                {enrolledMinPlaces > 1 ? "s" : ""} déjà inscrit
                {enrolledMinPlaces > 1 ? "s" : ""}). À {enrolledMinPlaces}, la
                session sera complète.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="s-label">Libellé (optionnel)</Label>
            <Input
              id="s-label"
              className={fieldClass}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex. Session automne 2026"
            />
          </div>

          <StaffChecklist
            title="Formateurs"
            options={formateurOptions}
            selectedIds={formateurIds}
            onChange={setFormateurIds}
            emptyHint="Aucun formateur en base. Ajoutez-en dans Intervenants (catégorie formateur)."
          />

          <StaffChecklist
            title="Intervenants"
            options={intervenantOptions}
            selectedIds={intervenantIds}
            onChange={setIntervenantIds}
            emptyHint="Aucun intervenant professionnel en base."
          />

          <label className="flex items-center gap-2 text-sm text-cream">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="size-4 rounded border-border"
            />
            Ouverte aux inscriptions
          </label>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button
            type="button"
            className="btn-cta"
            onClick={submit}
            disabled={pending || formations.length === 0}
          >
            {pending
              ? isEdit
                ? "Enregistrement…"
                : "Création…"
              : isEdit
                ? "J’enregistre"
                : "Je crée la session"}
          </Button>
        </div>
      </div>
    </div>
  );
}
