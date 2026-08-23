import { describe, expect, it } from "vitest";

import { avatarSrc, isAvatarKey } from "@/lib/avatars";

describe("isAvatarKey", () => {
  it("accepte les 30 clés de la palette", () => {
    expect(isAvatarKey("01")).toBe(true);
    expect(isAvatarKey("30")).toBe(true);
  });

  it("refuse une clé hors palette", () => {
    expect(isAvatarKey("31")).toBe(false);
    expect(isAvatarKey("upload.png")).toBe(false);
    expect(isAvatarKey(null)).toBe(false);
  });
});

describe("avatarSrc", () => {
  it("pointe vers le fichier public", () => {
    expect(avatarSrc("07")).toBe("/avatars/07.svg");
    expect(avatarSrc("xx")).toBeNull();
  });
});
