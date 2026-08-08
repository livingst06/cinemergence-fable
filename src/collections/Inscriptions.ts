import type { CollectionConfig } from "payload";

export const INSCRIPTION_STATUSES = [
  { label: "En cours d'instruction (legacy)", value: "en_instruction" },
  { label: "Paiement en cours", value: "en_paiement" },
  { label: "Inscrit (payé)", value: "payee" },
  { label: "Inscrit (legacy validé)", value: "validee" },
  { label: "Refusée", value: "refusee" },
  { label: "En attente de pièce complémentaire", value: "pieces_complementaires" },
  // Legacy (migration douce)
  { label: "Demande (legacy)", value: "demande" },
  { label: "Inscrit (legacy)", value: "inscrit" },
  { label: "Annulé (legacy)", value: "annule" },
] as const;

export type InscriptionStatusValue =
  (typeof INSCRIPTION_STATUSES)[number]["value"];

export const Inscriptions: CollectionConfig = {
  slug: "inscriptions",
  admin: {
    useAsTitle: "id",
    defaultColumns: ["user", "session", "formation", "status", "updatedAt"],
    description:
      "Inscriptions stagiaires liées à une session. Paiement Stripe → statut « payee » = place confirmée (pas de validation admin).",
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === "admin") return true;
      if (!req.user) return false;
      return { user: { equals: req.user.id } };
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
    {
      name: "session",
      type: "relationship",
      relationTo: "formation-sessions",
      required: false,
      index: true,
      label: "Session",
      admin: {
        description:
          "Obligatoire pour les nouvelles inscriptions. Une place = une session.",
      },
    },
    {
      name: "formation",
      type: "relationship",
      relationTo: "formations",
      required: true,
      index: true,
      admin: {
        description: "Dénormalisé depuis la session (filtre / affichage).",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "en_instruction",
      options: [...INSCRIPTION_STATUSES],
    },
    {
      name: "commentaireAdmin",
      type: "textarea",
      label: "Commentaire administrateur",
      admin: {
        description: "Visible par le stagiaire en cas de refus ou de pièces demandées.",
      },
    },
    {
      name: "codeParrainage",
      type: "text",
      label: "Code parrainage",
    },
    {
      name: "message",
      type: "textarea",
    },
    {
      name: "amountEuros",
      type: "number",
      label: "Montant (euros)",
      admin: {
        description: "Montant entier en euros au moment du hold / paiement.",
      },
    },
    {
      name: "currency",
      type: "text",
      defaultValue: "eur",
      admin: { readOnly: true },
    },
    {
      name: "holdExpiresAt",
      type: "date",
      label: "Expiration du hold",
      admin: {
        date: { pickerAppearance: "dayAndTime" },
        description: "Fin de la réservation temporaire (paiement).",
      },
    },
    {
      name: "stripeCheckoutSessionId",
      type: "text",
      label: "Stripe Checkout Session ID",
      index: true,
      admin: { readOnly: true },
    },
    {
      name: "stripePaymentIntentId",
      type: "text",
      label: "Stripe Payment Intent ID",
      admin: { readOnly: true },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        if (!data?.session) return data;
        const sessionId =
          typeof data.session === "object" && data.session
            ? (data.session as { id: number | string }).id
            : data.session;
        try {
          const sessionDoc = await req.payload.findByID({
            collection: "formation-sessions",
            id: sessionId,
            depth: 0,
            overrideAccess: true,
          });
          const formationRef = sessionDoc.formation;
          data.formation =
            typeof formationRef === "object" && formationRef
              ? (formationRef as { id: number | string }).id
              : formationRef;
        } catch {
          /* keep existing formation */
        }

        // Une seule inscription active par couple user + session
        const userId =
          typeof data.user === "object" && data.user
            ? (data.user as { id: number | string }).id
            : data.user;
        const status = data.status ?? originalDoc?.status;
        const blocking = [
          "en_instruction",
          "en_paiement",
          "payee",
          "demande",
          "validee",
          "inscrit",
          "pieces_complementaires",
        ];
        if (userId && sessionId && status && blocking.includes(String(status))) {
          const existing = await req.payload.find({
            collection: "inscriptions",
            where: {
              and: [
                { user: { equals: userId } },
                { session: { equals: sessionId } },
                { status: { in: blocking } },
              ],
            },
            limit: 5,
            depth: 0,
            overrideAccess: true,
          });
          const selfId =
            operation === "update" && originalDoc?.id != null
              ? String(originalDoc.id)
              : null;
          const conflict = existing.docs.find((d) => String(d.id) !== selfId);
          if (conflict) {
            throw new Error(
              "Ce stagiaire est déjà inscrit à cette session de formation.",
            );
          }
        }

        return data;
      },
    ],
  },
};
