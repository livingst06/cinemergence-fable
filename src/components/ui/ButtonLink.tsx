import Link from "next/link";
import type { ComponentProps } from "react";
import { type VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonLinkProps = ComponentProps<typeof Link> &
  VariantProps<typeof buttonVariants>;

function hasCustomSurface(className: ButtonLinkProps["className"]) {
  if (!className) return false;
  const value = typeof className === "string" ? className : String(className);
  return value.includes("btn-cta") || value.includes("btn-outline-warm");
}

export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        buttonVariants({
          // Évite bg-primary sous le dégradé btn-cta (double fond)
          variant: variant ?? (hasCustomSurface(className) ? "ghost" : "default"),
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}
