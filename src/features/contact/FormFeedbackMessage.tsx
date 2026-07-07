"use client";

import type { FormState } from "@/features/contact/form-state";
import { formFeedbackClassName } from "@/features/contact/use-form-feedback";
import { cn } from "@/lib/utils";

type FormFeedbackMessageProps = {
  state: FormState;
  className?: string;
};

export function FormFeedbackMessage({ state, className }: FormFeedbackMessageProps) {
  if (!state.message) return null;

  return (
    <p
      className={cn("text-sm", formFeedbackClassName(state.status), className)}
      role="status"
      aria-live="polite"
    >
      {state.message}
    </p>
  );
}
