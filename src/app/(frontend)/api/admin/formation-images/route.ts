import { randomUUID } from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/session-profile";
import { getPayloadClient } from "@/lib/payload";
import { resolveDisplayMediaUrl } from "@/lib/media-utils";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function extForMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/heic":
    case "image/heif":
      return ".heic";
    default:
      return ".jpg";
  }
}

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

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 8 Mo)" },
        { status: 400 },
      );
    }

    const mime = (file.type || "application/octet-stream").toLowerCase();
    if (!ALLOWED.has(mime) && !mime.startsWith("image/")) {
      return NextResponse.json({ error: "Type d'image non supporté" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = extForMime(mime);
    const tmpPath = path.join(os.tmpdir(), `cinemergence-formation-${randomUUID()}${ext}`);
    fs.writeFileSync(tmpPath, buffer);

    const altBase = file.name.replace(/\.[^.]+$/, "").trim() || "Photo formation";

    try {
      const payload = await getPayloadClient();
      const created = await payload.create({
        collection: "media",
        data: {
          alt: altBase.slice(0, 120),
          category: "autre",
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
