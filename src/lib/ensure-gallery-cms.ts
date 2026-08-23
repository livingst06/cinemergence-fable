import type { Payload } from "payload";

import { isS3StorageEnabled } from "@/lib/storage-env";
import { staticInterviewVideos } from "@/lib/site-media";

function mediaHaystack(doc: Record<string, unknown>): string {
  return [doc.filename, doc.url, doc.alt]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

export function filenameFromMediaUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").filter(Boolean).at(-1) ?? url;
  } catch {
    return url.split("/").filter(Boolean).at(-1) ?? url;
  }
}

/**
 * Payload `select` → enum Postgres. `push: false` n’ajoute pas la valeur tout seul.
 */
export async function ensureInterviewCategoryEnum(payload: Payload): Promise<string | null> {
  const pool = payload.db.pool;
  if (!pool) {
    throw new Error("Pool Postgres introuvable");
  }
  const { rows } = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM pg_enum e
       JOIN pg_type t ON t.oid = e.enumtypid
       WHERE t.typname = 'enum_media_category'
         AND e.enumlabel = 'interview'
     ) AS exists`,
  );
  if (rows[0]?.exists) return null;
  await pool.query(
    `ALTER TYPE enum_media_category ADD VALUE IF NOT EXISTS 'interview'`,
  );
  return "Catégorie media `interview` ajoutée en base";
}

/**
 * Enregistre les interviews (déjà dans le bucket) comme documents Payload
 * `media` catégorie `interview`, pour que l’admin puisse les CRUD.
 */
export async function ensureGalleryInterviews(payload: Payload): Promise<string[]> {
  const logs: string[] = [];
  const enumLog = await ensureInterviewCategoryEnum(payload);
  if (enumLog) logs.push(enumLog);

  const existing = await payload.find({
    collection: "media",
    limit: 300,
    depth: 0,
    overrideAccess: true,
  });

  for (const video of staticInterviewVideos) {
    const filename = filenameFromMediaUrl(video.url);
    const found = existing.docs.find((doc) =>
      mediaHaystack(doc as Record<string, unknown>).includes(filename.toLowerCase()),
    );

    if (found) {
      const current = found as { category?: string; alt?: string };
      if (current.category === "interview" && current.alt === video.alt) {
        logs.push(`Interview déjà CMS : ${filename}`);
        continue;
      }
      await payload.update({
        collection: "media",
        id: found.id,
        data: { category: "interview", alt: video.alt },
        overrideAccess: true,
      });
      logs.push(`Interview liée au CMS : ${filename}`);
      continue;
    }

    const response = await fetch(video.url);
    if (!response.ok) {
      logs.push(`⚠ Interview introuvable (${response.status}) : ${filename}`);
      continue;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const data = { alt: video.alt, category: "interview" as const };

    if (isS3StorageEnabled()) {
      await payload.create({
        collection: "media",
        data,
        file: {
          data: buffer,
          mimetype: video.mimeType,
          name: filename,
          size: buffer.length,
        },
        overrideAccess: true,
      });
    } else {
      logs.push(`⚠ Interview non créée (stockage local) : ${filename}`);
      continue;
    }
    logs.push(`Interview créée dans le CMS : ${filename}`);
  }

  return logs;
}
