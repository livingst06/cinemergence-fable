"use client";

import { useEffect, useState, useTransition } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { useAdminUi } from "@/features/admin/AdminUiContext";
import { updateProfileAvatar } from "@/features/profile/profile-actions";
import { UserAvatar } from "@/features/profile/UserAvatar";
import { AVATAR_KEYS, avatarSrc } from "@/lib/avatars";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  currentKey: string | null;
  name: string;
};

export function ProfileAvatar({ currentKey, name }: ProfileAvatarProps) {
  const { refreshSessionChrome } = useAdminUi();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentKey);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    setSelected(currentKey);
  }, [currentKey]);

  const choose = (key: string) => {
    if (pending) return;
    if (key === selected) {
      setOpen(false);
      return;
    }
    const previous = selected;
    setSelected(key);
    setError("");
    startTransition(async () => {
      const result = await updateProfileAvatar(key);
      if (!result.ok) {
        setSelected(previous);
        setError(result.error);
        return;
      }
      setOpen(false);
      refreshSessionChrome();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Changer d’avatar"
        className="shrink-0 cursor-pointer rounded-full outline outline-2 outline-offset-2 outline-transparent transition-colors hover:outline-convert/70 focus-visible:outline-convert"
      >
        <UserAvatar avatarKey={selected} name={name} className="size-16" />
      </button>

      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          if (!pending) setOpen(next);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-[100010] bg-noir-deep/90 backdrop-blur-sm" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-[100011] w-[min(100%-2rem,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-noir-secondary p-6 shadow-2xl outline-none">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="font-heading text-2xl text-cream">
                  Choisir un avatar
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm text-muted-text">
                  Il s’affichera sur ton profil et dans le salon de discussion.
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="Fermer"
                className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 text-cream hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-convert"
              >
                <X className="size-5" />
              </Dialog.Close>
            </div>

            <div className="mt-5 grid grid-cols-4 justify-items-center gap-2 sm:grid-cols-6 md:grid-cols-8">
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
                      "size-14 cursor-pointer overflow-hidden rounded-full outline outline-2 -outline-offset-2 focus-visible:ring-2 focus-visible:ring-convert/50 sm:size-16",
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
            ) : null}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
