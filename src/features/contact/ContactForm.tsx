"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "@/features/contact/actions";
import { FormFeedbackMessage } from "@/features/contact/FormFeedbackMessage";
import { useFormAction } from "@/features/contact/use-form-feedback";
import type { FormationData } from "@/lib/defaults";

type ContactFormProps = {
  formations: Pick<FormationData, "slug" | "titreCourt">[];
  defaultFormation?: string;
  defaultType?: "contact" | "inscription" | "financement";
};

export function ContactForm({
  formations,
  defaultFormation,
  defaultType = "contact",
}: ContactFormProps) {
  const { state, submit, pending } = useFormAction(submitContact);

  return (
    <form action={submit} className="space-y-6">
      <input type="hidden" name="type" value={defaultType} />
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            name="nom"
            required
            autoComplete="name"
            className="border-or/20 bg-noir-tertiary"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="border-or/20 bg-noir-tertiary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="telephone">Téléphone</Label>
        <Input
          id="telephone"
          name="telephone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          className="border-or/20 bg-noir-tertiary"
        />
      </div>

      {defaultType !== "financement" && (
        <div className="space-y-2">
          <Label htmlFor="formationSlug">Formation souhaitée</Label>
          <select
            id="formationSlug"
            name="formationSlug"
            defaultValue={defaultFormation ?? ""}
            className="flex h-11 min-h-11 w-full rounded-md border border-or/20 bg-noir-tertiary px-3 py-2 text-base text-cream md:text-sm"
          >
            <option value="">Choisir une formation (optionnel)</option>
            {formations.map((f) => (
              <option key={f.slug} value={f.slug}>
                {f.titreCourt}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          className="border-or/20 bg-noir-tertiary"
          placeholder={
            defaultType === "financement"
              ? "Décris ta situation (statut, projet, questions sur le financement)…"
              : "Dis-nous en quoi on peut t'aider…"
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="codeParrainage">Code parrainage</Label>
        <Input
          id="codeParrainage"
          name="codeParrainage"
          autoComplete="off"
          className="border-or/20 bg-noir-tertiary"
          placeholder="Si tu as été parrainé·e, indique le code ici"
        />
      </div>

      <FormFeedbackMessage state={state} />

      <Button
        type="submit"
        disabled={pending}
        className="btn-cta min-h-11"
      >
        {pending ? "J'envoie…" : "J'envoie ma demande"}
      </Button>
    </form>
  );
}
