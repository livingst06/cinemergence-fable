import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import { seedFounderPhotoOnly } from "@/seed/media-lib";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const payload = await getPayloadClient();
    const logs = await seedFounderPhotoOnly(payload);
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("[seed/founder]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seed founder failed" },
      { status: 500 },
    );
  }
}
