import { describe, expect, it } from "vitest";

import { filenameFromMediaUrl } from "@/lib/ensure-gallery-cms";
import { rotateItemsBySlug } from "@/lib/site-media";

describe("filenameFromMediaUrl", () => {
  it("extrait le fichier d’une URL Supabase", () => {
    expect(
      filenameFromMediaUrl(
        "https://example.supabase.co/storage/v1/object/public/cinemergence-media/media/cinemergence-96c719ff-cbb6-42b9-8db0-3c0dc6560dc6.mp4",
      ),
    ).toBe("cinemergence-96c719ff-cbb6-42b9-8db0-3c0dc6560dc6.mp4");
  });
});

describe("rotateItemsBySlug", () => {
  it("garde le même ordre pour un même slug", () => {
    const items = ["a", "b", "c"];
    expect(rotateItemsBySlug(items, "formation-jouer-face-camera")).toEqual(
      rotateItemsBySlug(items, "formation-jouer-face-camera"),
    );
    expect(rotateItemsBySlug(items, "formation-jouer-face-camera").sort()).toEqual(
      [...items].sort(),
    );
    expect(rotateItemsBySlug([], "x")).toEqual([]);
  });
});
