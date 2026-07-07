"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      richColors
      closeButton
      position="top-center"
      offset={{ top: "5rem" }}
      duration={5000}
      toastOptions={{
        classNames: {
          toast:
            "group toast border bg-noir-secondary text-cream shadow-lg backdrop-blur-md",
          title: "text-sm font-semibold",
          description: "text-sm text-muted-text",
          success:
            "border-emerald-500/40 bg-emerald-950/90 text-emerald-100 [&_[data-title]]:text-emerald-100",
          warning:
            "border-amber-500/40 bg-amber-950/90 text-amber-100 [&_[data-title]]:text-amber-100",
          error:
            "border-red-500/40 bg-red-950/90 text-red-100 [&_[data-title]]:text-red-100",
          closeButton:
            "border-white/10 bg-noir-tertiary text-cream hover:bg-noir",
        },
      }}
      {...props}
    />
  );
}
