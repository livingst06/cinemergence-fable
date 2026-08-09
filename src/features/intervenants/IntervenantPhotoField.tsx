"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { uploadIntervenantPhoto } from "@/features/intervenants/upload-intervenant-photo";
import { cn } from "@/lib/utils";

export type IntervenantPhotoItem = {
  id: number | string;
  url: string;
};

type IntervenantPhotoFieldProps = {
  photo: IntervenantPhotoItem | null;
  onChange: (next: IntervenantPhotoItem | null) => void;
  disabled?: boolean;
};

export function IntervenantPhotoField({
  photo,
  onChange,
  disabled,
}: IntervenantPhotoFieldProps) {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const suppressClickRef = useRef(false);

  const handleFile = async (fileList: FileList | File[]) => {
    const file = Array.from(fileList).find((f) => f.type.startsWith("image/"));
    if (!file) {
      toast.error("Aucune image valide");
      return;
    }

    setBusy(true);
    try {
      const uploaded = await uploadIntervenantPhoto(file);
      onChange(uploaded);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload impossible");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Photo</Label>
      <p className="text-xs text-muted-text">
        Glisse-dépose ou clique pour ajouter un portrait (stocké dans le bucket
        Supabase). Une seule photo.
      </p>

      {photo ? (
        <div className="relative mx-auto w-full max-w-[14rem]">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-border bg-noir-tertiary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt="Portrait"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => onChange(null)}
            aria-label="Supprimer la photo"
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-noir-secondary/95 text-cream shadow-md transition-colors hover:bg-red-500/90 hover:text-white"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || busy}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDragging(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            suppressClickRef.current = true;
            window.setTimeout(() => {
              suppressClickRef.current = false;
            }, 400);
            if (e.dataTransfer.files?.length) {
              void handleFile(e.dataTransfer.files);
            }
          }}
          onClick={() => {
            if (suppressClickRef.current || busy || disabled) return;
            fileInputRef.current?.click();
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-10 text-sm transition-colors",
            dragging
              ? "border-or/50 bg-or/10 text-or-light"
              : "border-border bg-noir-tertiary/40 text-muted-text hover:border-or/35 hover:text-cream",
            (disabled || busy) && "pointer-events-none opacity-60",
          )}
        >
          <ImagePlus className="size-6 opacity-80" aria-hidden />
          {busy
            ? "Upload…"
            : "Glisser-déposer une photo ici, ou cliquer"}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleFile(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
