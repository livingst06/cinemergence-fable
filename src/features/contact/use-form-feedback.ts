"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import type { FormState } from "@/features/contact/form-state";

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

export function useFormFeedback(state: FormState) {
  const lastMessage = useRef("");

  useEffect(() => {
    if (!state.message || state.message === lastMessage.current) return;
    lastMessage.current = state.message;

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
  }, [state.message, state.status]);
}
