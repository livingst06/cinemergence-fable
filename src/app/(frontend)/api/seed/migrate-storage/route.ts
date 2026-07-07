import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import { assertS3StorageConfigured } from "@/lib/storage-env";
import { prepareHeroAssets, seedMediaContent } from "@/seed/media-lib";

function isAuthorized(request: Request): boolean {
  const secret = process.env.MIGRATE_MEDIA_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";

  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    assertS3StorageConfigured();
    const payload = await getPayloadClient();
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "1";

    const heroLogs = await prepareHeroAssets();
    const mediaLogs = await seedMediaContent(payload, { force: force || true });

    return NextResponse.json({
      success: true,
      logs: [...heroLogs, ...mediaLogs],
    });
  } catch (error) {
    console.error("[seed/migrate-storage]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Migration failed" },
      { status: 500 },
    );
  }
}
