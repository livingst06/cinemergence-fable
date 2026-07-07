import { NextResponse } from "next/server";

import { prepareHeroAssets } from "@/seed/media-lib";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const logs = await prepareHeroAssets();
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("[seed/hero]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Hero generation failed" },
      { status: 500 },
    );
  }
}
