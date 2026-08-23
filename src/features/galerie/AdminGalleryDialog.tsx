"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  uploadGalleryMedia,
  type GalleryUploadPhase,
} from "@/features/galerie/upload-gallery-media";
import { validateAdminGalleryFile } from "@/lib/admin-gallery-upload";
import { GALLERY_INTERVIEW_CATEGORY } from "@/lib/gallery-admin";

type AdminGalleryDialogProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

function formatVideoSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1).replace(".", ",")} Go`;
  }
  return `${Math.max(1, Math.round(bytes / (1024 * 1024)))} Mo`;
}

export function AdminGalleryDialog({
  open,
  onClose,
  onSaved,
}: AdminGalleryDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState<GalleryUploadPhase>("optimize");

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset form
    setFile(null);
    setPending(false);
    setPercent(0);
    setPhase("optimize");
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    if (!file) {
      toast.error("Choisis une vidéo");
      return;
    }
    const validation = validateAdminGalleryFile(file);
    if (!validation.ok) {
      toast.error(validation.error);
      return;
    }
    if (validation.kind !== "video") {
      toast.error("Les interviews sont des vidéos (mp4, webm, mov)");
      return;
    }

    setPending(true);
    setPercent(0);
    setPhase("optimize");
    try {
      await uploadGalleryMedia(
        file,
        { category: GALLERY_INTERVIEW_CATEGORY },
        (nextPercent, nextPhase) => {
          setPhase(nextPhase);
          setPercent(nextPercent);
        },
      );
      toast.success("Interview ajoutée");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible");
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-start justify-center overflow-y-auto bg-noir/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-editor-title"
    >
      <div className="my-8 w-full max-w-lg rounded-2xl border border-border bg-noir-secondary p-6 shadow-2xl sm:p-8">
        <h2 id="gallery-editor-title" className="font-heading text-3xl text-cream">
          Nouvelle interview
        </h2>
        <p className="mt-2 text-sm text-muted-text">
          Vidéo d’élève (mp4, webm ou mov, jusqu’à 2 Go). Elle est compressée pour le
          téléphone (720p, assez net aussi sur ordinateur), puis envoyée vers le
          stockage.
        </p>

        <div className="mt-6 space-y-2">
          <Label htmlFor="gallery-file">Vidéo</Label>
          <input
            id="gallery-file"
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            disabled={pending}
            className="block w-full text-sm text-muted-text file:mr-3 file:rounded-full file:border file:border-border file:bg-noir-tertiary file:px-3 file:py-2 file:text-sm file:text-cream"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
            }}
          />
          {file ? (
            <p className="text-sm text-cream/80">
              {file.name} · {formatVideoSize(file.size)}
            </p>
          ) : null}
          {pending ? (
            <p className="text-sm text-or-light" aria-live="polite">
              {phase === "optimize"
                ? `Compression ${percent} %…`
                : `Envoi ${percent} %…`}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button type="button" onClick={() => void submit()} disabled={pending}>
            {pending
              ? phase === "optimize"
                ? "Compression…"
                : "Envoi…"
              : "Ajouter"}
          </Button>
        </div>
      </div>
    </div>
  );
}
