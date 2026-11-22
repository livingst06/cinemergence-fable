import { z } from "zod";

export const formationAdminSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug requis")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (minuscules, chiffres, tirets)"),
  titre: z.string().trim().min(2, "Titre requis"),
  titreCourt: z.string().trim().min(2, "Titre court requis"),
  pole: z.string().trim().min(1, "Pôle requis"),
  accroche: z.string().trim().min(2, "Accroche requise"),
  duree: z.string().trim().min(1, "Durée requise"),
  dureeHeures: z.number().int().min(1, "Nb heures requis"),
  dureeJours: z.number().int().min(1, "Nb jours requis"),
  format: z.string().trim().min(1, "Format requis"),
  tarif: z.string().trim().min(1, "Tarif requis"),
  tarifEuros: z.number().int().min(1, "Tarif en euros requis"),
  prioritaire: z.boolean(),
  audience: z.enum(["intermittent", "entreprise"]),
  publicCible: z.string().trim().min(1, "Public cible requis"),
  livrable: z.string().trim().min(1, "Livrable requis"),
  images: z.array(z.union([z.string(), z.number()])).max(8).optional().default([]),
});

export type FormationAdminInput = z.infer<typeof formationAdminSchema>;
