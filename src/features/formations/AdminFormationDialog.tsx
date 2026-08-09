"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createFormationAction,
  updateFormationAction,
  type FormationAdminInput,
} from "@/features/formations/admin-actions";
import {
  FormationPhotosField,
  type FormationPhotoItem,
} from "@/features/formations/FormationPhotosField";
import type { FormationData } from "@/lib/defaults";
import { slugify } from "@/lib/utils";

type AdminFormationDialogProps = {
  open: boolean;
  formation: FormationData | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  slug: string;
  titre: string;
  titreCourt: string;
  pole: string;
  accroche: string;
  duree: string;
  dureeHeures: string;
  dureeJours: string;
  format: string;
  tarif: string;
  tarifEuros: string;
  prioritaire: boolean;
  audience: "intermittent" | "entreprise";
  publicCible: string;
  livrable: string;
};

const emptyForm = (): FormState => ({
  slug: "",
  titre: "",
  titreCourt: "",
  pole: "Jeu",
  accroche: "",
  duree: "",
  dureeHeures: "",
  dureeJours: "",
  format: "",
  tarif: "",
  tarifEuros: "",
  prioritaire: false,
  audience: "intermittent",
  publicCible: "",
  livrable: "",
});

function fromFormation(formation: FormationData): FormState {
  return {
    slug: formation.slug,
    titre: formation.titre,
    titreCourt: formation.titreCourt,
    pole: formation.pole,
    accroche: formation.accroche,
    duree: formation.duree,
    dureeHeures:
      formation.dureeHeures != null ? String(formation.dureeHeures) : "",
    dureeJours:
      formation.dureeJours != null ? String(formation.dureeJours) : "",
    format: formation.format,
    tarif: formation.tarif ?? "",
    tarifEuros:
      formation.tarifEuros != null ? String(formation.tarifEuros) : "",
    prioritaire: formation.prioritaire,
    audience: formation.audience,
    publicCible: formation.publicCible,
    livrable: formation.livrable,
  };
}

function photosFromFormation(formation: FormationData | null): FormationPhotoItem[] {
  if (!formation) return [];
  if (formation.galleryImages && formation.galleryImages.length > 0) {
    return formation.galleryImages.map((g) => ({ id: g.id, url: g.url }));
  }
  if (formation.coverImageId && formation.coverImageUrl) {
    return [{ id: formation.coverImageId, url: formation.coverImageUrl }];
  }
  return [];
}

const fieldClass =
  "border-border bg-noir-tertiary/60 text-cream placeholder:text-muted-text";

export function AdminFormationDialog({
  open,
  formation,
  onClose,
  onSaved,
}: AdminFormationDialogProps) {
  const isEdit = Boolean(formation);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [photos, setPhotos] = useState<FormationPhotoItem[]>([]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setForm(formation ? fromFormation(formation) : emptyForm());
    setPhotos(photosFromFormation(formation));
    setSlugTouched(Boolean(formation));
  }, [open, formation]);

  if (!open) return null;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "titre" && !slugTouched && typeof value === "string") {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const submit = () => {
    if (!form.tarif.trim()) {
      toast.error("Tarif requis");
      return;
    }
    const tarifEurosRaw = form.tarifEuros.trim();
    const tarifEuros = Number.parseInt(tarifEurosRaw, 10);
    if (!tarifEurosRaw || Number.isNaN(tarifEuros) || tarifEuros < 1) {
      toast.error("Tarif euros requis (entier ≥ 1)");
      return;
    }
    const dureeHeures = Number.parseInt(form.dureeHeures.trim(), 10);
    const dureeJours = Number.parseInt(form.dureeJours.trim(), 10);
    if (Number.isNaN(dureeHeures) || dureeHeures < 1) {
      toast.error("Nb heures requis (entier ≥ 1)");
      return;
    }
    if (Number.isNaN(dureeJours) || dureeJours < 1) {
      toast.error("Nb jours requis (entier ≥ 1)");
      return;
    }

    const payload: FormationAdminInput = {
      slug: form.slug,
      titre: form.titre,
      titreCourt: form.titreCourt,
      pole: form.pole,
      accroche: form.accroche,
      duree: form.duree,
      dureeHeures,
      dureeJours,
      format: form.format,
      prioritaire: form.prioritaire,
      audience: form.audience,
      publicCible: form.publicCible,
      livrable: form.livrable,
      tarif: form.tarif.trim(),
      tarifEuros,
      images: photos.map((p) => p.id),
    };

    startTransition(async () => {
      const result =
        isEdit && formation?.id != null
          ? await updateFormationAction(formation.id, payload)
          : await createFormationAction(payload);

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
      aria-labelledby="formation-editor-title"
    >
      <div className="my-8 w-full max-w-2xl rounded-2xl border border-border bg-noir-secondary p-6 shadow-2xl sm:p-8">
        <h2 id="formation-editor-title" className="font-heading text-3xl text-cream">
          {isEdit ? "Modifier la formation" : "Ajouter une formation"}
        </h2>
        <p className="mt-2 text-sm text-muted-text">
          Catalogue et durée uniquement. Les dates et places se gèrent à la
          création d’une session (page Les sessions). Programme Qualiopi complet
          dans Payload.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <FormationPhotosField
            photos={photos}
            onChange={setPhotos}
            disabled={pending}
          />

          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="f-titre">Titre</Label>
            <Input
              id="f-titre"
              className={fieldClass}
              value={form.titre}
              onChange={(e) => setField("titre", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="f-titreCourt">Titre court</Label>
            <Input
              id="f-titreCourt"
              className={fieldClass}
              value={form.titreCourt}
              onChange={(e) => setField("titreCourt", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="f-slug">Slug</Label>
            <Input
              id="f-slug"
              className={fieldClass}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setField("slug", e.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="f-pole">Pôle</Label>
            <Input
              id="f-pole"
              className={fieldClass}
              value={form.pole}
              onChange={(e) => setField("pole", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="f-audience">Public</Label>
            <select
              id="f-audience"
              className={`flex h-9 w-full rounded-lg border px-3 text-sm ${fieldClass}`}
              value={form.audience}
              onChange={(e) =>
                setField("audience", e.target.value as FormState["audience"])
              }
            >
              <option value="intermittent">Intermittents</option>
              <option value="entreprise">Entreprise</option>
            </select>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="f-accroche">Accroche</Label>
            <Textarea
              id="f-accroche"
              className={fieldClass}
              rows={3}
              value={form.accroche}
              onChange={(e) => setField("accroche", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="f-duree">Durée (libellé)</Label>
            <Input
              id="f-duree"
              className={fieldClass}
              value={form.duree}
              onChange={(e) => setField("duree", e.target.value)}
              placeholder="35 heures — 5 journées"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="f-duree-heures">Nb heures</Label>
            <Input
              id="f-duree-heures"
              type="number"
              min={1}
              step={1}
              className={fieldClass}
              value={form.dureeHeures}
              onChange={(e) => setField("dureeHeures", e.target.value)}
              placeholder="35"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="f-duree-jours">Nb jours</Label>
            <Input
              id="f-duree-jours"
              type="number"
              min={1}
              step={1}
              className={fieldClass}
              value={form.dureeJours}
              onChange={(e) => setField("dureeJours", e.target.value)}
              placeholder="5"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="f-format">Format</Label>
            <Input
              id="f-format"
              className={fieldClass}
              value={form.format}
              onChange={(e) => setField("format", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="f-tarif">Tarif (libellé)</Label>
            <Input
              id="f-tarif"
              className={fieldClass}
              value={form.tarif}
              onChange={(e) => setField("tarif", e.target.value)}
              placeholder="1 400 €"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="f-tarif-euros">Tarif Stripe (euros)</Label>
            <Input
              id="f-tarif-euros"
              type="number"
              min={1}
              step={1}
              className={fieldClass}
              value={form.tarifEuros}
              onChange={(e) => setField("tarifEuros", e.target.value)}
              placeholder="1400"
              required
            />
            <p className="text-xs text-muted-text">
              Hérité par toutes les sessions de cette formation.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="f-livrable">Livrable</Label>
            <Input
              id="f-livrable"
              className={fieldClass}
              value={form.livrable}
              onChange={(e) => setField("livrable", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="f-public">Public cible</Label>
            <Input
              id="f-public"
              className={fieldClass}
              value={form.publicCible}
              onChange={(e) => setField("publicCible", e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-cream sm:col-span-2">
            <input
              type="checkbox"
              checked={form.prioritaire}
              onChange={(e) => setField("prioritaire", e.target.checked)}
              className="size-4 rounded border-border"
            />
            À la une
          </label>
        </div>

        {isEdit && (
          <p className="mt-4 text-xs text-muted-text">
            <Link href="/admin" className="text-or-light underline-offset-2 hover:underline">
              Édition complète dans Payload
            </Link>
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button type="button" className="btn-cta" onClick={submit} disabled={pending}>
            {pending ? "Enregistrement…" : isEdit ? "J'enregistre" : "Je crée la formation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
