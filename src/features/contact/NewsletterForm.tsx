"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitNewsletter } from "@/features/contact/newsletter-actions";

const initialState = { success: false, message: "" };

export function NewsletterForm() {
  const [state, action, pending] = useActionState(submitNewsletter, initialState);

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row">
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
      {state.message && (
        <p className="w-full text-sm text-or-light sm:col-span-2" role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}
