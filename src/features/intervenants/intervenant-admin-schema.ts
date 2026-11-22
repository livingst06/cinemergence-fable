import { z } from "zod";

export const intervenantAdminSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug requis")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (minuscules, chiffres, tirets)"),
  nom: z.string().trim().min(2, "Nom requis"),
  role: z.string().trim().min(2, "Rôle requis"),
  email: z
    .union([z.string().email("Email invalide"), z.literal(""), z.null()])
    .optional()
    .transform((v) => (typeof v === "string" && v.trim() ? v.trim() : null)),
  categorie: z.enum(["professionnel", "formateur"]),
  parrain: z.boolean(),
  bio: z.string().trim().min(2, "Bio requise"),
  filmographie: z.array(z.string().trim().min(1)).optional().default([]),
  photoId: z.union([z.string(), z.number()]).optional().nullable(),
});

export type IntervenantAdminInput = z.infer<typeof intervenantAdminSchema>;
