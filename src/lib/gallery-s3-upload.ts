import { randomUUID } from "crypto";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { extForGalleryMime } from "@/lib/admin-gallery-upload";
import { assertS3StorageConfigured } from "@/lib/storage-env";

export const MEDIA_S3_PREFIX = "media";
export const GALLERY_VIDEO_UPLOAD_EXPIRES_SEC = 2 * 60 * 60;

const INTERVIEW_FILENAME_RE =
  /^interview-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(mp4|webm|mov)$/i;

export function isInterviewObjectFilename(filename: string): boolean {
  return INTERVIEW_FILENAME_RE.test(filename);
}

export function newInterviewFilename(mime: string): string {
  return `interview-${randomUUID()}${extForGalleryMime(mime)}`;
}

export function interviewObjectKey(filename: string): string {
  return `${MEDIA_S3_PREFIX}/${filename}`;
}

export function publicMediaObjectUrl(objectKey: string): string {
  const base = (process.env.SUPABASE_STORAGE_PUBLIC_URL || "").replace(/\/$/, "");
  return `${base}/${objectKey}`;
}

function getGalleryS3Client(): S3Client {
  assertS3StorageConfigured();
  return new S3Client({
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    region: process.env.S3_REGION || "eu-west-1",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
  });
}

export async function presignInterviewVideoPut(input: {
  filename: string;
  mimeType: string;
  filesize: number;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const key = interviewObjectKey(input.filename);
  const client = getGalleryS3Client();
  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: input.mimeType,
      ContentLength: input.filesize,
    }),
    { expiresIn: GALLERY_VIDEO_UPLOAD_EXPIRES_SEC },
  );
  return {
    uploadUrl,
    publicUrl: publicMediaObjectUrl(key),
    key,
  };
}

export async function assertInterviewObjectUploaded(input: {
  filename: string;
  filesize: number;
}): Promise<void> {
  const key = interviewObjectKey(input.filename);
  const client = getGalleryS3Client();
  const head = await client.send(
    new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    }),
  );
  const stored = head.ContentLength ?? 0;
  if (stored < 1) {
    throw new Error("Fichier vide dans le stockage");
  }
  if (Math.abs(stored - input.filesize) > 16) {
    throw new Error("Taille du fichier stocké incohérente");
  }
}
