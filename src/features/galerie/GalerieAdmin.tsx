"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { useAdminUi } from "@/features/admin/AdminUiContext";
import { AdminDeleteConfirmDialog } from "@/features/formations/AdminDeleteConfirmDialog";
import { AdminGalleryDialog } from "@/features/galerie/AdminGalleryDialog";
import { GalleryGrid, type GalleryGridItem } from "@/features/galerie/GalleryGrid";
import { deleteGalleryMediaAction } from "@/features/galerie/galerie-admin-actions";
import { uploadGalleryMedia } from "@/features/galerie/upload-gallery-media";
import { partitionAdminGalleryImages } from "@/lib/admin-gallery-upload";
import {
  GALLERY_PLATEAU_CATEGORIES,
  MAX_GALLERY_PHOTO_BATCH,
} from "@/lib/gallery-admin";

type GalerieAdminProps = {
  interviews: GalleryGridItem[];
  plateau: GalleryGridItem[];
};

const EMPTY_PLATEAU = "Aucune photo pour l’instant.";
const EMPTY_INTERVIEWS = "Aucune interview pour l’instant.";
const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

export function GalerieAdmin({ interviews, plateau }: GalerieAdminProps) {
  const { isAdminMode } = useAdminUi();
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryGridItem | null>(null);
  const [deletePending, startDelete] = useTransition();
  const [photoUploadPending, setPhotoUploadPending] = useState(false);

  const refresh = () => router.refresh();

  const openCreateInterview = () => {
    setEditorOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) {
      setDeleteTarget(null);
      return;
    }
    const id = deleteTarget.id;
    startDelete(async () => {
      const result = await deleteGalleryMediaAction(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setDeleteTarget(null);
      refresh();
    });
  };

  const uploadPlateauPhotos = async (list: FileList | File[]) => {
    if (photoUploadPending) return;

    const { accepted, rejectedCount } = partitionAdminGalleryImages(
      Array.from(list),
    );
    if (rejectedCount > 0) {
      toast.message(
        rejectedCount === 1
          ? "1 fichier ignoré (format ou taille)"
          : `${rejectedCount} fichiers ignorés (format ou taille)`,
      );
    }
    if (accepted.length === 0) {
      toast.error("Aucune photo valide");
      return;
    }

    const truncated = Math.max(0, accepted.length - MAX_GALLERY_PHOTO_BATCH);
    const batch = accepted.slice(0, MAX_GALLERY_PHOTO_BATCH);
    if (truncated > 0) {
      toast.message(
        `Seules les ${MAX_GALLERY_PHOTO_BATCH} premières photos seront ajoutées`,
      );
    }

    setPhotoUploadPending(true);
    const toastId = toast.loading(
      batch.length === 1 ? "Ajout de la photo…" : `Ajout 0/${batch.length}…`,
    );
    let ok = 0;
    try {
      for (const file of batch) {
        await uploadGalleryMedia(file, {
          category: GALLERY_PLATEAU_CATEGORIES[0],
        });
        ok += 1;
        toast.loading(
          batch.length === 1
            ? "Ajout de la photo…"
            : `Ajout ${ok}/${batch.length}…`,
          { id: toastId },
        );
      }
      toast.success(ok === 1 ? "Photo ajoutée" : `${ok} photos ajoutées`, {
        id: toastId,
      });
      refresh();
    } catch (error) {
      toast.error(
        ok > 0
          ? `${ok} ajoutée(s), puis échec`
          : error instanceof Error
            ? error.message
            : "Upload impossible",
        { id: toastId },
      );
      if (ok > 0) refresh();
    } finally {
      setPhotoUploadPending(false);
    }
  };

  const interviewAdmin = isAdminMode
    ? {
        onAdd: openCreateInterview,
        onDelete: (item: GalleryGridItem) => setDeleteTarget(item),
        addLabel: "Ajouter une interview",
      }
    : undefined;

  const plateauAdmin = isAdminMode
    ? {
        onAdd: () => {
          if (photoUploadPending) return;
          photoInputRef.current?.click();
        },
        onDelete: (item: GalleryGridItem) => setDeleteTarget(item),
        addLabel: photoUploadPending ? "Ajout en cours…" : "Ajouter des photos",
      }
    : undefined;

  return (
    <>
      <input
        ref={photoInputRef}
        type="file"
        accept={PHOTO_ACCEPT}
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const files = event.target.files;
          event.target.value = "";
          if (files && files.length > 0) {
            void uploadPlateauPhotos(files);
          }
        }}
      />

      <PageHero
        title="Les interviews"
        description={
          <p className="text-pretty text-base leading-relaxed md:text-xl md:leading-relaxed">
            Paroles d&apos;élèves, filmées pendant les formations
          </p>
        }
      >
        <div className="mt-6 max-w-4xl md:mt-10">
          {interviews.length > 0 || isAdminMode ? (
            <GalleryGrid items={interviews} compact admin={interviewAdmin} />
          ) : (
            <p className="text-muted-text">{EMPTY_INTERVIEWS}</p>
          )}
        </div>
      </PageHero>
      <PageHero
        headingAs="h2"
        title="Sur le plateau"
        description={
          <p className="text-pretty text-base leading-relaxed md:text-xl md:leading-relaxed">
            Moments capturés pendant nos sessions de formation
          </p>
        }
      />
      <Section className="pt-6 pb-16 md:pt-10 md:pb-28">
        <div className="container-page">
          {plateau.length > 0 || isAdminMode ? (
            <GalleryGrid items={plateau} admin={plateauAdmin} />
          ) : (
            <p className="text-center text-muted-text">{EMPTY_PLATEAU}</p>
          )}
        </div>
      </Section>

      <AdminGalleryDialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSaved={refresh}
      />

      <AdminDeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.alt ?? ""}
        entityLabel="fiche média"
        pending={deletePending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
