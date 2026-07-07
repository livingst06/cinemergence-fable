/** Supabase Storage (S3-compatible) — production only. Local dev uses disk + PostgreSQL. */

function hasS3Credentials(): boolean {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      process.env.S3_ENDPOINT &&
      process.env.SUPABASE_STORAGE_PUBLIC_URL,
  );
}

/**
 * Local (localhost): Payload stores metadata in PostgreSQL, binaries in `/media`.
 * Production (Vercel): Supabase Storage bucket via the S3 plugin.
 *
 * Override with `MEDIA_STORAGE=local` or `MEDIA_STORAGE=supabase`.
 */
export function isS3StorageEnabled(): boolean {
  const mode = process.env.MEDIA_STORAGE?.toLowerCase();

  if (mode === "local") return false;

  if (mode === "supabase" || mode === "s3") {
    return hasS3Credentials();
  }

  // Default: never S3 in development, Supabase when creds exist in production.
  if (process.env.NODE_ENV === "development") return false;

  return hasS3Credentials();
}

export function isLocalMediaStorage(): boolean {
  return !isS3StorageEnabled();
}

export function getMediaStorageMode(): "local" | "supabase" {
  return isS3StorageEnabled() ? "supabase" : "local";
}

export function assertS3StorageConfigured(): void {
  if (!isS3StorageEnabled()) {
    throw new Error(
      "Stockage S3/Supabase non configuré. Définir S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT et SUPABASE_STORAGE_PUBLIC_URL (production uniquement).",
    );
  }
}
