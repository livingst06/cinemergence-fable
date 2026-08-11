const DEV_FALLBACK_SECRET = "dev-secret-change-in-production-min-32";

/**
 * Payload secret: fallback only in local development.
 * Preview/production must set PAYLOAD_SECRET explicitly.
 */
export function resolvePayloadSecret(): string {
  const fromEnv = process.env.PAYLOAD_SECRET?.trim();
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "development") {
    return DEV_FALLBACK_SECRET;
  }

  throw new Error(
    "PAYLOAD_SECRET is required outside development (set it in the environment).",
  );
}

/**
 * Seed HTTP routes: local `next dev` only.
 * Blocks production and Vercel preview/deployments.
 */
export function isSeedHttpAllowed(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.VERCEL === "1") return false;
  return process.env.NODE_ENV === "development";
}

/** Migrate-storage: require Bearer secret except pure local development without secret. */
export function isMigrateStorageAuthorized(request: Request): boolean {
  const secret = process.env.MIGRATE_MEDIA_SECRET?.trim();
  if (secret) {
    const header = request.headers.get("authorization");
    return header === `Bearer ${secret}`;
  }
  // No secret configured: only allow local development (never Vercel).
  return process.env.NODE_ENV === "development" && process.env.VERCEL !== "1";
}
