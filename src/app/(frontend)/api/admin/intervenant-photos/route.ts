import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { isPersistedMediaUrl, resolveDisplayMediaUrl } from "@/lib/media-utils";
import { getPayloadClient } from "@/lib/payload";
import { requireAdmin } from "@/lib/session-profile";
import { assertS3StorageConfigured } from "@/lib/storage-env";

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

function isSupabasePublicUrl(url: string): boolean {
  const base = (
    process.env.SUPABASE_STORAGE_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PUBLIC_URL ||
    ""
  ).replace(/\/$/, "");
  if (base && url.startsWith(base)) return true;
  return isPersistedMediaUrl(url);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    assertS3StorageConfigured();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Bucket Supabase non configuré (S3_* / SUPABASE_STORAGE_PUBLIC_URL).",
      },
      { status: 503 },
    );
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
    // Préfixe « portraits/ » → clé bucket media/portraits/{uuid}.ext via le plugin S3.
    const filename = `portraits/${randomUUID()}${ext}`;
    const altBase =
      file.name.replace(/\.[^.]+$/, "").trim() || "Portrait intervenant";

    const payload = await getPayloadClient();
    const created = await payload.create({
      collection: "media",
      data: {
        alt: altBase.slice(0, 120),
        category: "portrait",
      },
      file: {
        data: buffer,
        mimetype: mime.startsWith("image/") ? mime : "image/jpeg",
        name: filename,
        size: buffer.length,
      },
      overrideAccess: true,
    });

    const url = resolveDisplayMediaUrl(created);
    if (!url || !isSupabasePublicUrl(url)) {
      console.error("[intervenant-photos] URL non-Supabase après upload:", url);
      return NextResponse.json(
        {
          error:
            "Upload effectué mais l’URL publique Supabase est introuvable. Vérifie SUPABASE_STORAGE_PUBLIC_URL.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ id: created.id, url });
  } catch (error) {
    console.error("[intervenant-photos]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message
            ? error.message
            : "Upload impossible vers le bucket Supabase",
      },
      { status: 500 },
    );
  }
}
