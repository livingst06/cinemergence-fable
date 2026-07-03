import { NextResponse } from "next/server";

import { newsletterSchema } from "@/lib/validations";
import { getPayloadClient } from "@/lib/payload";

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
    const payload = await getPayloadClient();
    await payload.create({
      collection: "form-submissions",
      data: {
        type: "newsletter",
        email: parsed.data.email,
        payload: parsed.data,
      },
    });
  } catch (error) {
    console.error("[newsletter-api]", error);
  }

  // Brancher Brevo via BREVO_API_KEY
  return NextResponse.json({ success: true });
}
