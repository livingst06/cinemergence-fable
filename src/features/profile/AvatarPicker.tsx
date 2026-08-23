"use client";

import { useState, useTransition } from "react";

import { updateProfileAvatar } from "@/features/profile/profile-actions";
import { AVATAR_KEYS, avatarSrc } from "@/lib/avatars";
import { cn } from "@/lib/utils";

type AvatarPickerProps = {
  currentKey: string | null;
};

export function AvatarPicker({ currentKey }: AvatarPickerProps) {
  const [selected, setSelected] = useState(currentKey);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const choose = (key: string) => {
    if (key === selected || pending) return;
    const previous = selected;
    setSelected(key);
    setError("");
    startTransition(async () => {
      const result = await updateProfileAvatar(key);
      if (!result.ok) {
        setSelected(previous);
        setError(result.error);
      }
    });
  };

  return (
    <div>
      <div className="grid grid-cols-4 justify-items-center gap-2 sm:grid-cols-6 md:grid-cols-8">
        {AVATAR_KEYS.map((key) => {
          const src = avatarSrc(key);
          const isSelected = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => choose(key)}
              disabled={pending}
              aria-pressed={isSelected}
              aria-label={`Choisir l’avatar ${key}`}
              className={cn(
                "size-16 overflow-hidden rounded-full outline outline-2 -outline-offset-2 focus-visible:ring-2 focus-visible:ring-convert/50",
                isSelected
                  ? "outline-convert"
                  : "outline-white/10 hover:outline-convert/50",
              )}
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt=""
                  width={64}
                  height={64}
                  className="size-full object-cover"
                />
              ) : null}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-400" role="status">
          {error}
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted-text">
          Clique sur un avatar pour l’enregistrer. Tu ne peux pas importer ta propre photo.
        </p>
      )}
    </div>
  );
}
