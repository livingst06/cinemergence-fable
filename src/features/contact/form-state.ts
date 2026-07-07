export type FormStatus = "success" | "validation" | "error";

export type FormState = {
  status: FormStatus;
  message: string;
};

export const initialFormState: FormState = {
  status: "validation",
  message: "",
};
