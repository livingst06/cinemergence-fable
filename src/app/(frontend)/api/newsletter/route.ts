import { NextResponse } from "next/server";

import { createFormSubmission } from "@/lib/form-submissions";
import { newsletterSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const parsed = newsletterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ success: true });
  }

  try {
    await createFormSubmission({
      type: "newsletter",
      email: parsed.data.email,
      payload: parsed.data,
    });
  } catch (error) {
    console.error("[newsletter-api]", error);
  }

  // Brancher Brevo via BREVO_API_KEY
  return NextResponse.json({ success: true });
}
