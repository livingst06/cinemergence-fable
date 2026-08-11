import { afterEach, describe, expect, it, vi } from "vitest";

import { validateAdminImageFile } from "@/lib/admin-image-upload";
import {
  isMigrateStorageAuthorized,
  isSeedHttpAllowed,
  resolvePayloadSecret,
} from "@/lib/env-guards";

describe("validateAdminImageFile", () => {
  it("accepte jpeg/png dans la limite", () => {
    expect(validateAdminImageFile({ type: "image/jpeg", size: 1024 })).toEqual({
      ok: true,
      mime: "image/jpeg",
    });
  });

  it("refuse un MIME hors liste même image/*", () => {
    const result = validateAdminImageFile({ type: "image/svg+xml", size: 100 });
    expect(result.ok).toBe(false);
  });

  it("refuse un fichier trop gros", () => {
    const result = validateAdminImageFile({
      type: "image/png",
      size: 9 * 1024 * 1024,
    });
    expect(result.ok).toBe(false);
  });
});

describe("env-guards", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolvePayloadSecret utilise le fallback en development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("PAYLOAD_SECRET", "");
    expect(resolvePayloadSecret()).toContain("dev-secret");
  });

  it("resolvePayloadSecret exige une env hors development", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PAYLOAD_SECRET", "");
    expect(() => resolvePayloadSecret()).toThrow(/PAYLOAD_SECRET/);
  });

  it("isSeedHttpAllowed bloque Vercel et production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL", "1");
    expect(isSeedHttpAllowed()).toBe(false);

    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", "");
    expect(isSeedHttpAllowed()).toBe(false);

    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL", "");
    expect(isSeedHttpAllowed()).toBe(true);
  });

  it("isMigrateStorageAuthorized exige le Bearer si secret défini", () => {
    vi.stubEnv("MIGRATE_MEDIA_SECRET", "s3cret");
    const denied = isMigrateStorageAuthorized(
      new Request("http://localhost", { headers: {} }),
    );
    expect(denied).toBe(false);

    const ok = isMigrateStorageAuthorized(
      new Request("http://localhost", {
        headers: { authorization: "Bearer s3cret" },
      }),
    );
    expect(ok).toBe(true);
  });
});
