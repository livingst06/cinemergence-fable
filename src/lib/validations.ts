import { z } from "zod";

export const contactSchema = z.object({
  nom: z.string().min(2, "Nom requis (2 caractères minimum)"),
  email: z.string().email("Email invalide"),
  telephone: z.string().optional(),
  message: z.string().min(10, "Message requis (10 caractères minimum)"),
  formationSlug: z.string().optional(),
  type: z.enum(["contact", "inscription", "financement"]).default("contact"),
  website: z.string().max(0).optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email("Email invalide"),
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
