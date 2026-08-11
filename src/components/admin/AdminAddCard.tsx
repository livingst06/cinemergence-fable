"use client";

import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminAddCardProps = {
  label: string;
  onAdd: () => void;
  className?: string;
  minHeightClassName?: string;
};

export function AdminAddCard({
  label,
  onAdd,
  className,
  minHeightClassName = "min-h-[18rem]",
}: AdminAddCardProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={label}
      className={cn(
        "card-stage group flex h-full w-full flex-col items-center justify-center gap-3 border-dashed border-or/30 bg-noir-tertiary/40 p-6 text-center transition-colors hover:border-or/50 hover:bg-noir-tertiary/70",
        minHeightClassName,
        className,
      )}
    >
      <Plus
        className="size-11 text-cream/50 transition-colors group-hover:text-or-light"
        strokeWidth={1.75}
        aria-hidden
      />
      <p className="text-sm font-medium text-cream/70 transition-colors group-hover:text-cream">
        {label}
      </p>
    </button>
  );
}
