/** Longueur max d’un message de salon (Payload + formulaire). */
export const SALON_POST_MAX_LENGTH = 2000;

export type SalonPostView = {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: string;
};

