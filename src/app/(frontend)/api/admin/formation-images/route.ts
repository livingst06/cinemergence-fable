import { randomUUID } from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";

import { extForImageMime, validateAdminImageFile } from "@/lib/admin-image-upload";
import { resolveDisplayMediaUrl } from "@/lib/media-utils";
import { getPayloadClient } from "@/lib/payload";
import { requireAdmin } from "@/lib/session-profile";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    const validation = validateAdminImageFile(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = extForImageMime(validation.mime);
    const tmpPath = path.join(os.tmpdir(), `cinemergence-formation-${randomUUID()}${ext}`);
    fs.writeFileSync(tmpPath, buffer);

    const altBase = file.name.replace(/\.[^.]+$/, "").trim() || "Photo formation";

    try {
      const payload = await getPayloadClient();
      const created = await payload.create({
        collection: "media",
        data: {
          alt: altBase.slice(0, 120),
          category: "formation",
        },
        filePath: tmpPath,
        overrideAccess: true,
      });

      const url = resolveDisplayMediaUrl(created);
      if (!url) {
        return NextResponse.json({ error: "URL media introuvable" }, { status: 500 });
      }

      return NextResponse.json({ id: created.id, url });
    } finally {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    }
  } catch (error) {
    console.error("[formation-images]", error);
    return NextResponse.json({ error: "Upload impossible" }, { status: 500 });
  }
}
