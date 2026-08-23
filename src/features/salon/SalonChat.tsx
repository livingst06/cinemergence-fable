"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SendHorizonal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/features/profile/UserAvatar";
import { createSalonPost } from "@/features/salon/salon-actions";
import { notifyFormFeedback } from "@/features/contact/use-form-feedback";
import { initialFormState } from "@/features/contact/form-state";
import {
  isSalonStaffRole,
  SALON_POST_MAX_LENGTH,
  SALON_STAFF_ROLE_LABEL,
  type SalonPostView,
} from "@/lib/salon-constants";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/user-roles";

type SalonChatProps = {
  salonId: string;
  currentUserId: string;
  posts: SalonPostView[];
};

function dayLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (sameDay) return "Aujourd’hui";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
  if (sameYesterday) return "Hier";
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function roleNameClass(role: UserRole): string {
  if (role === "admin") return "text-amber-300";
  if (role === "formateur") return "text-convert-light";
  if (role === "intervenant") return "text-projector-light";
  return "text-convert-light";
}

function roleBadgeClass(role: Exclude<UserRole, "eleve">): string {
  if (role === "admin") return "bg-amber-400/15 text-amber-300";
  if (role === "formateur") return "bg-convert/15 text-convert-light";
  return "bg-white/10 text-projector-light";
}

function roleRingClass(role: UserRole): string {
  if (role === "admin") return "ring-2 ring-amber-400/70";
  if (role === "formateur") return "ring-2 ring-convert/70";
  if (role === "intervenant") return "ring-2 ring-projector-light/70";
  return "";
}

export function SalonChat({ salonId, currentUserId, posts }: SalonChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [posts.length]);

  const submit = (formData: FormData) => {
    const body = String(formData.get("body") ?? "").trim();
    if (!body || pending) return;
    setError("");
    startTransition(async () => {
      const result = await createSalonPost(initialFormState, formData);
      if (result.status === "success") {
        formRef.current?.reset();
        if (textareaRef.current) textareaRef.current.style.height = "";
        router.refresh();
        return;
      }
      setError(result.message);
      notifyFormFeedback(result);
    });
  };

  return (
    <div className="flex h-[min(36rem,calc(100dvh-12rem))] min-h-[22rem] w-full min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b141a]">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 md:px-4">
        {posts.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-muted-text">
            Aucun message pour le moment. Sois le premier à écrire.
          </p>
        ) : (
          <ul className="space-y-1">
            {posts.map((post, index) => {
              const mine = post.authorId !== "" && post.authorId === currentUserId;
              const prev = posts[index - 1];
              const showDay =
                !prev || dayKey(prev.createdAt) !== dayKey(post.createdAt);
              const grouped =
                Boolean(prev) &&
                !showDay &&
                prev.authorId === post.authorId;
              return (
                <li key={post.id}>
                  {showDay ? (
                    <p className="my-3 text-center text-[11px] font-medium uppercase tracking-wide text-muted-text">
                      <span className="inline-block rounded-full bg-white/10 px-3 py-1">
                        {dayLabel(post.createdAt)}
                      </span>
                    </p>
                  ) : null}
                  <div
                    className={cn(
                      "flex max-w-full gap-2",
                      mine ? "justify-end" : "justify-start",
                      grouped ? "mt-0.5" : "mt-2",
                    )}
                  >
                    {!mine ? (
                      grouped ? (
                        <span className="size-8 shrink-0" aria-hidden />
                      ) : (
                        <UserAvatar
                          avatarKey={post.authorAvatarKey}
                          name={post.authorName}
                          className={cn(
                            "mt-0.5 size-8 shrink-0",
                            roleRingClass(post.authorRole),
                          )}
                        />
                      )
                    ) : null}
                    <div
                      className={cn(
                        "max-w-[min(100%,20rem)] min-w-0 px-3 py-2 text-sm leading-relaxed sm:max-w-[min(100%,28rem)]",
                        mine
                          ? "rounded-2xl rounded-br-md bg-convert text-white"
                          : "rounded-2xl rounded-bl-md bg-[#1f2c34] text-cream",
                      )}
                    >
                      {!mine && !grouped ? (
                        <div className="mb-0.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                          <p
                            className={cn(
                              "text-xs font-semibold",
                              roleNameClass(post.authorRole),
                            )}
                          >
                            {post.authorFirstName}
                          </p>
                          {isSalonStaffRole(post.authorRole) ? (
                            <span
                              className={cn(
                                "rounded-full px-1.5 py-px text-[10px] font-medium uppercase tracking-wide",
                                roleBadgeClass(post.authorRole),
                              )}
                            >
                              {SALON_STAFF_ROLE_LABEL[post.authorRole]}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      <p className="whitespace-pre-wrap break-words">{post.body}</p>
                      {post.createdAt ? (
                        <p
                          className={cn(
                            "mt-1 text-right text-[10px] leading-none",
                            mine ? "text-white/70" : "text-muted-text",
                          )}
                        >
                          {formatTime(post.createdAt)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        ref={formRef}
        action={submit}
        className="flex shrink-0 items-end gap-2 border-t border-white/[0.06] bg-[#111b21] px-2 py-2 md:px-3"
      >
        <input type="hidden" name="salonId" value={salonId} />
        <label htmlFor="salon-post-body" className="sr-only">
          Ton message
        </label>
        <textarea
          ref={textareaRef}
          id="salon-post-body"
          name="body"
          required
          rows={1}
          maxLength={SALON_POST_MAX_LENGTH}
          placeholder="Message"
          className="max-h-32 min-h-11 w-full min-w-0 resize-none rounded-2xl border-0 bg-[#2a3942] px-3.5 py-2.5 text-base text-cream outline-none placeholder:text-muted-text focus-visible:ring-2 focus-visible:ring-convert/50 md:text-sm"
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.shiftKey) return;
            event.preventDefault();
            formRef.current?.requestSubmit();
          }}
        />
        <Button
          type="submit"
          disabled={pending}
          size="icon-lg"
          className="btn-cta size-11 shrink-0 rounded-full"
          aria-label={pending ? "Publication…" : "Envoyer"}
        >
          <SendHorizonal className="size-5" />
        </Button>
      </form>
      {error ? (
        <p className="px-3 pb-2 text-xs text-red-400" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
