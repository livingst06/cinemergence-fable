import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  ADMIN_GALLERY_VIDEO_MAX_BYTES,
  ADMIN_GALLERY_VIDEO_MIME_TYPES,
} from "@/lib/admin-gallery-upload";
import { GALLERY_INTERVIEW_CATEGORY } from "@/lib/gallery-admin";
import {
  MEDIA_S3_PREFIX,
  assertInterviewObjectUploaded,
  isInterviewObjectFilename,
  publicMediaObjectUrl,
  interviewObjectKey,
} from "@/lib/gallery-s3-upload";
import { ensureInterviewCategoryEnum } from "@/lib/ensure-gallery-cms";
import { resolveDisplayMediaUrl } from "@/lib/media-utils";
import { getPayloadClient } from "@/lib/payload";
import { requireAdmin } from "@/lib/session-profile";
import { assertS3StorageConfigured } from "@/lib/storage-env";

export const runtime = "nodejs";

const completeSchema = z.object({
  filename: z.string().min(8).max(80),
  mimeType: z.string().min(1),
  filesize: z.number().int().positive(),
  alt: z.string().trim().max(160).optional(),
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

  const parsed = completeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isInterviewObjectFilename(parsed.data.filename)) {
    return NextResponse.json({ error: "Fichier invalide" }, { status: 400 });
  }

  const mime = parsed.data.mimeType.toLowerCase();
  if (!ADMIN_GALLERY_VIDEO_MIME_TYPES.has(mime)) {
    return NextResponse.json({ error: "Type vidéo invalide" }, { status: 400 });
  }
  if (parsed.data.filesize > ADMIN_GALLERY_VIDEO_MAX_BYTES) {
    return NextResponse.json(
      { error: "Vidéo trop volumineuse (max 2 Go)" },
      { status: 400 },
    );
  }

  try {
    await assertInterviewObjectUploaded({
      filename: parsed.data.filename,
      filesize: parsed.data.filesize,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Fichier introuvable dans le stockage",
      },
      { status: 400 },
    );
  }

  const publicUrl = publicMediaObjectUrl(interviewObjectKey(parsed.data.filename));
  const alt =
    parsed.data.alt?.trim() ||
    parsed.data.filename.replace(/\.[^.]+$/, "") ||
    "Interview élève";

  try {
    const payload = await getPayloadClient();
    await ensureInterviewCategoryEnum(payload);
    const created = await payload.create({
      collection: "media",
      data: {
        alt: alt.slice(0, 160),
        category: GALLERY_INTERVIEW_CATEGORY,
        filename: parsed.data.filename,
        mimeType: mime,
        filesize: parsed.data.filesize,
        url: publicUrl,
        prefix: MEDIA_S3_PREFIX,
      },
      file: {
        data: Buffer.from([0]),
        mimetype: mime,
        name: parsed.data.filename,
        size: 1,
      },
      context: { skipCloudStorage: true },
      overrideAccess: true,
    });

    await payload.update({
      collection: "media",
      id: created.id,
      data: {
        filename: parsed.data.filename,
        mimeType: mime,
        filesize: parsed.data.filesize,
        url: publicUrl,
        prefix: MEDIA_S3_PREFIX,
      },
      context: { skipCloudStorage: true },
      overrideAccess: true,
    });

    const url = resolveDisplayMediaUrl(created) ?? publicUrl;
    revalidatePath("/galerie");
    revalidatePath("/");
    revalidatePath("/formations", "layout");

    return NextResponse.json({
      id: created.id,
      url,
      mimeType: mime,
    });
  } catch (error) {
    console.error("[gallery-media/complete]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message
            ? error.message
            : "Enregistrement CMS impossible",
      },
      { status: 500 },
    );
  }
}
