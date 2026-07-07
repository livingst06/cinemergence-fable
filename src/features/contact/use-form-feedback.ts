"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { FormState } from "@/features/contact/form-state";
import { initialFormState } from "@/features/contact/form-state";

export function formFeedbackClassName(status: FormState["status"]): string {
  switch (status) {
    case "success":
      return "text-emerald-400";
    case "validation":
      return "text-amber-400";
    case "error":
      return "text-red-400";
  }
}

export function notifyFormFeedback(state: FormState): void {
  if (!state.message) return;

  switch (state.status) {
    case "success":
      toast.success(state.message);
      break;
    case "validation":
      toast.warning(state.message);
      break;
    case "error":
      toast.error(state.message);
      break;
  }
}

type FormAction = (
  prev: FormState,
  formData: FormData,
) => Promise<FormState>;

export function useFormAction(action: FormAction) {
  const [state, setState] = useState<FormState>(initialFormState);
  const [pending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    startTransition(async () => {
      const result = await action(state, formData);
      setState(result);
      notifyFormFeedback(result);
    });
  };

  return { state, submit, pending };
}
