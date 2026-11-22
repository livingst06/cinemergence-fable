import { getPayloadClient } from "@/lib/payload";

type FormSubmissionWrite = {
  type: "contact" | "inscription" | "financement" | "newsletter";
  email: string;
  nom?: string;
  telephone?: string;
  message?: string;
  formationSlug?: string;
  codeParrainage?: string;
  payload: unknown;
};

export async function createFormSubmission(data: FormSubmissionWrite): Promise<void> {
  const payload = await getPayloadClient();
  await payload.create({
    collection: "form-submissions",
    data,
  });
}
