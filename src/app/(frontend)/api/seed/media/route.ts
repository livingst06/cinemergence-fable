import { NextResponse } from "next/server";

import { isSeedHttpAllowed } from "@/lib/env-guards";
import { getPayloadClient } from "@/lib/payload";
import { prepareHeroAssets, seedMediaContent } from "@/seed/media-lib";

export async function POST(request: Request) {
  if (!isSeedHttpAllowed()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const payload = await getPayloadClient();
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "1";
    const heroLogs = await prepareHeroAssets();
    const mediaLogs = await seedMediaContent(payload, { force });
    const { ensureGalleryInterviews } = await import("@/lib/ensure-gallery-cms");
    const interviewLogs = await ensureGalleryInterviews(payload);

    return NextResponse.json({
      success: true,
      logs: [...heroLogs, ...mediaLogs, ...interviewLogs],
    });
  } catch (error) {
    console.error("[seed/media]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seed media failed" },
      { status: 500 },
    );
  }
}
