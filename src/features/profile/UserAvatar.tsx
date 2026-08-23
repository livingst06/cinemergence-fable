import { cn } from "@/lib/utils";
import { avatarSrc } from "@/lib/avatars";

type UserAvatarProps = {
  avatarKey?: string | null;
  name?: string;
  className?: string;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return letters || "?";
}

export function UserAvatar({ avatarKey, name = "", className }: UserAvatarProps) {
  const src = avatarSrc(avatarKey);
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={64}
        height={64}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-cream",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
