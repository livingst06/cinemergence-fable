"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { uploadFormationImage } from "@/features/formations/upload-formation-image";
import { cn } from "@/lib/utils";

export const MAX_FORMATION_IMAGES = 8;

export type FormationPhotoItem = {
  id: number | string;
  url: string;
};

type FormationPhotosFieldProps = {
  photos: FormationPhotoItem[];
  onChange: (next: FormationPhotoItem[]) => void;
  disabled?: boolean;
};

function SortablePhoto({
  photo,
  index,
  onRemove,
}: {
  photo: FormationPhotoItem;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: String(photo.id) });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-noir-tertiary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={`Photo ${index + 1}`}
          className="h-full w-full object-cover"
          draggable={false}
        />
        {index === 0 ? (
          <span className="absolute left-2 top-2 rounded-full bg-or/90 px-2 py-0.5 text-xs font-semibold tracking-wide text-noir">
            Cover
          </span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Supprimer cette photo"
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-noir-secondary/95 text-cream shadow-md transition-colors hover:bg-red-500/90 hover:text-white"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

export function FormationPhotosField({
  photos,
  onChange,
  disabled,
}: FormationPhotosFieldProps) {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const suppressClickRef = useRef(false);
  const photosRef = useRef(photos);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      toast.error("Aucune image valide");
      return;
    }

    const room = MAX_FORMATION_IMAGES - photosRef.current.length;
    if (room <= 0) {
      toast.error(`Maximum ${MAX_FORMATION_IMAGES} photos`);
      return;
    }

    const batch = files.slice(0, room);
    if (files.length > room) {
      toast.message(`Seules ${room} photo(s) ajoutée(s) (max ${MAX_FORMATION_IMAGES})`);
    }

    setBusy(true);
    setDoneCount(0);
    setTotalCount(batch.length);

    const next = [...photosRef.current];
    try {
      for (let i = 0; i < batch.length; i += 1) {
        const uploaded = await uploadFormationImage(batch[i]!);
        next.push(uploaded);
        onChange([...next]);
        setDoneCount(i + 1);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload impossible");
    } finally {
      setBusy(false);
      setDoneCount(0);
      setTotalCount(0);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = photos.map((p) => String(p.id));
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(photos, oldIndex, newIndex));
  };

  return (
    <div className="sm:col-span-2 space-y-3">
      <Label>Photos</Label>
      <p className="text-xs text-muted-text">
        Glisse-dépose ou clique pour ajouter. Réordonne les vignettes — la 1re devient la
        cover de la card (max {MAX_FORMATION_IMAGES}).
      </p>

      {photos.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext
            items={photos.map((p) => String(p.id))}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo, index) => (
                <SortablePhoto
                  key={String(photo.id)}
                  photo={photo}
                  index={index}
                  onRemove={() => onChange(photos.filter((p) => p.id !== photo.id))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : null}

      {photos.length < MAX_FORMATION_IMAGES ? (
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
              void handleFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => {
            if (suppressClickRef.current || busy || disabled) return;
            fileInputRef.current?.click();
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-sm transition-colors",
            dragging
              ? "border-or/50 bg-or/10 text-or-light"
              : "border-border bg-noir-tertiary/40 text-muted-text hover:border-or/35 hover:text-cream",
            (disabled || busy) && "pointer-events-none opacity-60",
          )}
        >
          <ImagePlus className="size-6 opacity-80" aria-hidden />
          {busy
            ? `Upload ${doneCount}/${totalCount}…`
            : "Glisser-déposer des photos ici, ou cliquer"}
        </button>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
