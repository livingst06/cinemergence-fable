import type { CollectionConfig } from "payload";

/**
 * Session datée d’une formation (plusieurs sessions possibles par formation).
 */
export const FormationSessions: CollectionConfig = {
  slug: "formation-sessions",
  labels: {
    singular: "Session",
    plural: "Sessions",
  },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "formation", "dateDebut", "dateFin", "placesOffertes", "active"],
    description:
      "Sessions datées : une formation peut avoir plusieurs sessions à des dates différentes. Les élèves s’inscrivent à une session.",
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "formation",
      type: "relationship",
      relationTo: "formations",
      required: true,
      index: true,
    },
    {
      name: "label",
      type: "text",
      label: "Libellé (optionnel)",
      admin: {
        description: "Ex. « Session automne 2026 ». Sinon les dates servent de titre.",
      },
    },
    {
      name: "dateDebut",
      type: "date",
      required: true,
      label: "Date de début",
      admin: {
        date: { pickerAppearance: "dayOnly" },
      },
      index: true,
    },
    {
      name: "dateFin",
      type: "date",
      required: true,
      label: "Date de fin",
      admin: {
        date: { pickerAppearance: "dayOnly" },
      },
    },
    {
      name: "placesOffertes",
      type: "number",
      required: true,
      min: 0,
      label: "Places offertes",
      admin: {
        description: "Capacité de cette session uniquement.",
      },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      label: "Ouverte aux inscriptions",
    },
    {
      name: "formateurs",
      type: "relationship",
      relationTo: "intervenants",
      hasMany: true,
      label: "Formateurs",
      admin: {
        description:
          "Formateurs pédagogiques présents sur cette session (catégorie formateur).",
      },
      filterOptions: {
        categorie: { equals: "formateur" },
      },
    },
    {
      name: "intervenants",
      type: "relationship",
      relationTo: "intervenants",
      hasMany: true,
      label: "Intervenants",
      admin: {
        description:
          "Intervenants professionnels présents sur cette session (catégorie professionnel).",
      },
      filterOptions: {
        categorie: { equals: "professionnel" },
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Le tarif est toujours celui de la formation (pas de override session).
        if (data && "tarifEuros" in data) {
          delete data.tarifEuros;
        }
        // Pas de label ISO auto (« Session 2026-09-18 → … ») : l’UI affiche
        // « Session du … » via formatFormationSessionLabel. Label libre optionnel.
        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create") return doc;
        try {
          const existing = await req.payload.find({
            collection: "session-salons",
            where: { session: { equals: doc.id } },
            limit: 1,
            depth: 0,
            overrideAccess: true,
          });
          if (existing.docs[0]) return doc;
          await req.payload.create({
            collection: "session-salons",
            data: { session: doc.id },
            overrideAccess: true,
          });
        } catch (error) {
          req.payload.logger.error({
            err: error,
            msg: "Création du salon de session impossible",
            sessionId: doc.id,
          });
        }
        return doc;
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        try {
          const salons = await req.payload.find({
            collection: "session-salons",
            where: { session: { equals: id } },
            limit: 20,
            depth: 0,
            overrideAccess: true,
          });
          for (const salon of salons.docs) {
            await req.payload.delete({
              collection: "salon-posts",
              where: { salon: { equals: salon.id } },
              overrideAccess: true,
            });
            await req.payload.delete({
              collection: "session-salons",
              id: salon.id,
              overrideAccess: true,
            });
          }
        } catch (error) {
          req.payload.logger.error({
            err: error,
            msg: "Suppression du salon de session impossible",
            sessionId: id,
          });
        }
      },
    ],
  },
};
