import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ADMIN_GALLERY_VIDEO_MAX_BYTES,
  ADMIN_GALLERY_VIDEO_MIME_TYPES,
} from "@/lib/admin-gallery-upload";
import {
  newInterviewFilename,
  presignInterviewVideoPut,
} from "@/lib/gallery-s3-upload";
import { requireAdmin } from "@/lib/session-profile";
import { assertS3StorageConfigured } from "@/lib/storage-env";

export const runtime = "nodejs";

const signSchema = z.object({
  mimeType: z.string().min(1),
  filesize: z.number().int().positive(),
});

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
          error instanceof Error ? error.message : "Stockage Supabase non configuré",
      },
      { status: 503 },
    );
  }

  const parsed = signSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const mime = parsed.data.mimeType.toLowerCase();
  if (!ADMIN_GALLERY_VIDEO_MIME_TYPES.has(mime)) {
    return NextResponse.json(
      { error: "Les interviews sont des vidéos (mp4, webm, mov)" },
      { status: 400 },
    );
  }
  if (parsed.data.filesize > ADMIN_GALLERY_VIDEO_MAX_BYTES) {
    return NextResponse.json(
      { error: "Vidéo trop volumineuse (max 2 Go)" },
      { status: 400 },
    );
  }

  const filename = newInterviewFilename(mime);
  const signed = await presignInterviewVideoPut({
    filename,
    mimeType: mime,
    filesize: parsed.data.filesize,
  });

  return NextResponse.json({
    filename,
    mimeType: mime,
    uploadUrl: signed.uploadUrl,
    publicUrl: signed.publicUrl,
  });
}
