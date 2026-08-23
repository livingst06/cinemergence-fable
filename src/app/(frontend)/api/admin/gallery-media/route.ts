import { randomUUID } from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import {
  extForGalleryMime,
  validateAdminGalleryFile,
} from "@/lib/admin-gallery-upload";
import {
  DEFAULT_GALLERY_PHOTO_ALT,
  GALLERY_INTERVIEW_CATEGORY,
  GALLERY_PLATEAU_CATEGORIES,
  type GalleryAdminCategory,
} from "@/lib/gallery-admin";
import { resolveDisplayMediaUrl } from "@/lib/media-utils";
import { ensureInterviewCategoryEnum } from "@/lib/ensure-gallery-cms";
import {
  OPTIMIZED_IMAGE_EXT,
  OPTIMIZED_IMAGE_MIME,
  optimizeAdminImage,
} from "@/lib/optimize-admin-image";
import { getPayloadClient } from "@/lib/payload";
import { requireAdmin } from "@/lib/session-profile";
import { isS3StorageEnabled } from "@/lib/storage-env";

export const runtime = "nodejs";
export const maxDuration = 60;

const CATEGORIES = new Set<string>([
  ...GALLERY_PLATEAU_CATEGORIES,
  GALLERY_INTERVIEW_CATEGORY,
]);

function parseCategory(raw: FormDataEntryValue | null): GalleryAdminCategory | null {
  if (typeof raw !== "string" || !CATEGORIES.has(raw)) return null;
  return raw as GalleryAdminCategory;
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

    const validation = validateAdminGalleryFile(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const category = parseCategory(form.get("category"));
    if (!category) {
      return NextResponse.json({ error: "Catégorie invalide" }, { status: 400 });
    }

    if (category === GALLERY_INTERVIEW_CATEGORY) {
      return NextResponse.json(
        {
          error:
            "Les interviews (jusqu’à 2 Go) s’envoient directement vers le stockage, pas par ce formulaire.",
        },
        { status: 400 },
      );
    }
    if (validation.kind !== "image") {
      return NextResponse.json(
        { error: "Le plateau n’accepte que des photos (jpeg, png, webp)" },
        { status: 400 },
      );
    }

    const altRaw = form.get("alt");
    const alt =
      typeof altRaw === "string" && altRaw.trim()
        ? altRaw.trim().slice(0, 160)
        : validation.kind === "image"
          ? DEFAULT_GALLERY_PHOTO_ALT
          : file.name.replace(/\.[^.]+$/, "").trim() || "Interview élève";
    const captionRaw = form.get("caption");
    const caption =
      typeof captionRaw === "string" && captionRaw.trim()
        ? captionRaw.trim().slice(0, 240)
        : undefined;

    const original = Buffer.from(await file.arrayBuffer());
    let buffer: Buffer = original;
    let mime = validation.mime;
    let ext = extForGalleryMime(validation.mime);

    if (validation.kind === "image") {
      try {
        const optimized = await optimizeAdminImage(original);
        buffer = Buffer.from(optimized.buffer);
        mime = OPTIMIZED_IMAGE_MIME;
        ext = OPTIMIZED_IMAGE_EXT;
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Optimisation impossible",
          },
          { status: 400 },
        );
      }
    }

    const filename = `gallery/${randomUUID()}${ext}`;

    const payload = await getPayloadClient();
    await ensureInterviewCategoryEnum(payload);
    const data = {
      alt,
      caption,
      category,
    };

    const created = isS3StorageEnabled()
      ? await payload.create({
          collection: "media",
          data,
          file: {
            data: buffer,
            mimetype: mime,
            name: filename,
            size: buffer.length,
          },
          overrideAccess: true,
        })
      : await createFromTempFile(buffer, ext, data);

    const url = resolveDisplayMediaUrl(created);
    if (!url) {
      return NextResponse.json({ error: "URL media introuvable" }, { status: 500 });
    }

    revalidatePath("/galerie");
    revalidatePath("/");
    revalidatePath("/formations", "layout");

    return NextResponse.json({
      id: created.id,
      url,
      mimeType: mime,
    });
  } catch (error) {
    console.error("[gallery-media]", error);
    const raw = error instanceof Error ? error.message : "";
    const truncatedBody = /FormData|boundary/i.test(raw);
    return NextResponse.json(
      {
        error: truncatedBody
          ? "Fichier trop volumineux pour le serveur. Les photos passent par ici ; les interviews s’envoient directement vers le stockage."
          : raw || "Upload impossible",
      },
      { status: truncatedBody ? 413 : 500 },
    );
  }
}

async function createFromTempFile(
  buffer: Buffer,
  ext: string,
  data: { alt: string; caption?: string; category: GalleryAdminCategory },
) {
  const tmpPath = path.join(os.tmpdir(), `cinemergence-gallery-${randomUUID()}${ext}`);
  fs.writeFileSync(tmpPath, buffer);
  try {
    const payload = await getPayloadClient();
    return payload.create({
      collection: "media",
      data,
      filePath: tmpPath,
      overrideAccess: true,
    });
  } finally {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
}
