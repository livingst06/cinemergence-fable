import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { extForImageMime, validateAdminImageFile } from "@/lib/admin-image-upload";
import { isPersistedMediaUrl, resolveDisplayMediaUrl } from "@/lib/media-utils";
import { getPayloadClient } from "@/lib/payload";
import { requireAdmin } from "@/lib/session-profile";
import { assertS3StorageConfigured } from "@/lib/storage-env";

export const runtime = "nodejs";

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

    const validation = validateAdminImageFile(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = extForImageMime(validation.mime);
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
        mimetype: validation.mime,
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
