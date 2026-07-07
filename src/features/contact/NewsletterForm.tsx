"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialFormState } from "@/features/contact/form-state";
import { FormFeedbackMessage } from "@/features/contact/FormFeedbackMessage";
import { submitNewsletter } from "@/features/contact/newsletter-actions";
import { useFormFeedback } from "@/features/contact/use-form-feedback";

export function NewsletterForm() {
  const [state, action, pending] = useActionState(submitNewsletter, initialFormState);
  useFormFeedback(state);

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
      <div className="flex-1 space-y-2">
        <Label htmlFor="newsletter-email" className="sr-only">
          Email
        </Label>
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="Ton email"
          className="border-or/20 bg-noir-tertiary"
        />
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="btn-cta"
      >
        {pending ? "..." : "M'informer"}
      </Button>
      <FormFeedbackMessage state={state} className="w-full" />
    </form>
  );
}
