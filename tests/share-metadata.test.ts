import { statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { SHARE_IMAGE_PATH, shareImage, socialMetadata } from "@/lib/share-metadata";

describe("socialMetadata", () => {
  it("pose la même image sur Open Graph et X", () => {
    const meta = socialMetadata({
      title: "Masterclass",
      description: "Formation stand-up",
      url: "https://cinemergence.fr/formations/kheiron",
    });

    expect(meta.openGraph).toMatchObject({
      type: "website",
      locale: "fr_FR",
      siteName: "Cinémergence",
      title: "Masterclass",
      description: "Formation stand-up",
      url: "https://cinemergence.fr/formations/kheiron",
      images: [shareImage],
    });
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Masterclass",
      description: "Formation stand-up",
      images: [shareImage],
    });
  });

  it("garde un JPEG léger, aux dimensions déclarées", () => {
    const file = path.join(process.cwd(), "public", SHARE_IMAGE_PATH);
    const { size } = statSync(file);
    expect(shareImage.url).toBe(SHARE_IMAGE_PATH);
    expect(shareImage.type).toBe("image/jpeg");
    expect(shareImage.width).toBe(1200);
    expect(shareImage.height).toBe(675);
    expect(size).toBeGreaterThan(20_000);
    expect(size).toBeLessThan(300_000);
  });
});
