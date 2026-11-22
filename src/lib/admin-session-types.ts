export type AdminSessionTrainee = {
  id: number | string;
  userName: string;
  userEmail: string;
  avatarKey: string | null;
  status: string;
  amountEuros: number | null;
};

export type AdminSessionStaff = {
  id: number | string;
  nom: string;
  email: string | null;
  photoUrl: string | null;
};

export type FormationOption = {
  id: number | string;
  titre: string;
  slug: string;
  tarifEuros: number | null;
  tarif: string | null;
};

export type SessionStaffOption = {
  id: number | string;
  nom: string;
  email: string;
  role: "formateur" | "intervenant";
};

export type AdminSessionGroup = {
  sessionId: number | string;
  formationId: number | string;
  label: string | null;
  formationTitre: string;
  formationSlug: string;
  dateDebut: string;
  dateFin: string;
  placesOffertes: number;
  tarifEuros: number | null;
  active: boolean;
  trainees: AdminSessionTrainee[];
  formateurs: AdminSessionStaff[];
  intervenants: AdminSessionStaff[];
};
