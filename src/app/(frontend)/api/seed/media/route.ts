import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import { prepareHeroAssets, seedMediaContent } from "@/seed/media-lib";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const payload = await getPayloadClient();
    const heroLogs = await prepareHeroAssets();
    const mediaLogs = await seedMediaContent(payload);

    return NextResponse.json({
      success: true,
      logs: [...heroLogs, ...mediaLogs],
    });
  } catch (error) {
    console.error("[seed/media]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seed media failed" },
      { status: 500 },
    );
  }
}
