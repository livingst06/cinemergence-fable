/** Stockage médias unique : bucket Supabase (S3) pour local, preview et prod. */

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
 * Même bucket Supabase partout (localhost / preview / prod) dès que les
 * credentials S3_* sont présentes — partagé avec la BDD Postgres unique.
 *
 * Opt-out explicite : `MEDIA_STORAGE=local` (disque `/media`, hors sync).
 * Forçage : `MEDIA_STORAGE=supabase` ou `MEDIA_STORAGE=s3`.
 */
export function isS3StorageEnabled(): boolean {
  const mode = process.env.MEDIA_STORAGE?.toLowerCase();

  if (mode === "local") return false;

  if (mode === "supabase" || mode === "s3") {
    if (!hasS3Credentials()) {
      throw new Error(
        "MEDIA_STORAGE=supabase mais credentials S3_* / SUPABASE_STORAGE_PUBLIC_URL manquantes.",
      );
    }
    return true;
  }

  // Défaut : Supabase dès que les credentials sont là (tous environnements).
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
      "Stockage S3/Supabase non configuré. Définir S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT et SUPABASE_STORAGE_PUBLIC_URL (même config local / preview / prod).",
    );
  }
}
