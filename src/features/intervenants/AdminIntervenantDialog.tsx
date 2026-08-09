"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  IntervenantPhotoField,
  type IntervenantPhotoItem,
} from "@/features/intervenants/IntervenantPhotoField";
import {
  createIntervenantAction,
  updateIntervenantAction,
  type IntervenantAdminInput,
} from "@/features/intervenants/intervenants-admin-actions";
import type { IntervenantData } from "@/lib/defaults";
import { isPersistedMediaUrl } from "@/lib/media-utils";
import { slugify } from "@/lib/utils";

const fieldClass =
  "border-border bg-noir-tertiary/60 text-cream placeholder:text-muted-text";

type Categorie = "professionnel" | "formateur";

type FormState = {
  nom: string;
  slug: string;
  role: string;
  email: string;
  categorie: Categorie;
  parrain: boolean;
  bio: string;
  filmographieText: string;
};

function emptyForm(categorie: Categorie): FormState {
  return {
    nom: "",
    slug: "",
    role: "",
    email: "",
    categorie,
    parrain: false,
    bio: "",
    filmographieText: "",
  };
}

function fromIntervenant(i: IntervenantData): FormState {
  return {
    nom: i.nom,
    slug: i.slug,
    role: i.role,
    email: i.email ?? "",
    categorie: i.categorie === "formateur" ? "formateur" : "professionnel",
    parrain: i.parrain,
    bio: i.bio,
    filmographieText: i.filmographie.join("\n"),
  };
}

function photoFromIntervenant(i: IntervenantData | null): IntervenantPhotoItem | null {
  if (!i?.photoId || !i.photoUrl) return null;
  if (!isPersistedMediaUrl(i.photoUrl) && !i.photoUrl.startsWith("/api/media/")) {
    // Fallback static /images — pas un media CMS éditable
    return null;
  }
  return { id: i.photoId, url: i.photoUrl };
}

type AdminIntervenantDialogProps = {
  open: boolean;
  editing: IntervenantData | null;
  /** Catégorie préremplie à la création (selon la section). */
  defaultCategorie: Categorie;
  onClose: () => void;
  onSaved: () => void;
};

export function AdminIntervenantDialog({
  open,
  editing,
  defaultCategorie,
  onClose,
  onSaved,
}: AdminIntervenantDialogProps) {
  const isEdit = Boolean(editing);
  const [form, setForm] = useState<FormState>(() => emptyForm(defaultCategorie));
  const [photo, setPhoto] = useState<IntervenantPhotoItem | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm(fromIntervenant(editing));
      setPhoto(photoFromIntervenant(editing));
      setSlugTouched(true);
      return;
    }
    setForm(emptyForm(defaultCategorie));
    setPhoto(null);
    setSlugTouched(false);
  }, [open, editing, defaultCategorie]);

  if (!open) return null;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "nom" && !slugTouched && typeof value === "string") {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const submit = () => {
    const filmographie = form.filmographieText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const payload: IntervenantAdminInput = {
      nom: form.nom.trim(),
      slug: form.slug.trim(),
      role: form.role.trim(),
      email: form.email.trim() || null,
      categorie: form.categorie,
      parrain: form.parrain,
      bio: form.bio.trim(),
      filmographie,
      photoId: photo?.id ?? null,
    };

    startTransition(async () => {
      const result =
        isEdit && editing?.id != null
          ? await updateIntervenantAction(editing.id, payload)
          : await createIntervenantAction(payload);
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
      aria-labelledby="intervenant-editor-title"
    >
      <div className="my-8 w-full max-w-lg rounded-2xl border border-border bg-noir-secondary p-6 shadow-2xl sm:p-8">
        <h2
          id="intervenant-editor-title"
          className="font-heading text-3xl text-cream"
        >
          {isEdit ? "Modifier le profil" : "Nouveau profil"}
        </h2>
        <p className="mt-2 text-sm text-muted-text">
          {isEdit
            ? "Mettez à jour les informations du formateur ou de l’intervenant."
            : "Renseignez le profil : il apparaîtra dans la section correspondante."}
        </p>

        <div className="mt-6 grid gap-4">
          <IntervenantPhotoField
            photo={photo}
            onChange={setPhoto}
            disabled={pending}
          />

          <div className="space-y-2">
            <Label htmlFor="i-nom">Nom et prénom</Label>
            <Input
              id="i-nom"
              className={fieldClass}
              value={form.nom}
              onChange={(e) => setField("nom", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="i-slug">Slug</Label>
            <Input
              id="i-slug"
              className={fieldClass}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setField("slug", e.target.value);
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="i-role">Rôle</Label>
            <Input
              id="i-role"
              className={fieldClass}
              value={form.role}
              onChange={(e) => setField("role", e.target.value)}
              placeholder="Ex. Acteur"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="i-email">Email (optionnel)</Label>
            <Input
              id="i-email"
              type="email"
              className={fieldClass}
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="pour les mails groupés depuis Les sessions"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="i-categorie">Catégorie</Label>
            <select
              id="i-categorie"
              className={`flex h-9 w-full rounded-lg border px-3 text-sm ${fieldClass}`}
              value={form.categorie}
              onChange={(e) =>
                setField("categorie", e.target.value as Categorie)
              }
            >
              <option value="professionnel">Intervenant professionnel</option>
              <option value="formateur">Formateur pédagogique</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-cream">
            <input
              type="checkbox"
              checked={form.parrain}
              onChange={(e) => setField("parrain", e.target.checked)}
              className="size-4 rounded border-border"
            />
            Parrain de l’association
          </label>

          <div className="space-y-2">
            <Label htmlFor="i-bio">Bio</Label>
            <Textarea
              id="i-bio"
              className={`min-h-28 ${fieldClass}`}
              value={form.bio}
              onChange={(e) => setField("bio", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="i-filmo">Filmographie (une ligne = un titre)</Label>
            <Textarea
              id="i-filmo"
              className={`min-h-24 ${fieldClass}`}
              value={form.filmographieText}
              onChange={(e) => setField("filmographieText", e.target.value)}
              placeholder={"Banlieue 13\nTaken"}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button
            type="button"
            className="btn-cta"
            onClick={submit}
            disabled={pending}
          >
            {pending
              ? isEdit
                ? "Enregistrement…"
                : "Création…"
              : isEdit
                ? "J’enregistre"
                : "Je crée le profil"}
          </Button>
        </div>
      </div>
    </div>
  );
}
