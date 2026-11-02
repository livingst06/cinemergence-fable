import { statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  KHEIRON_SHARE_IMAGE_PATH,
  SHARE_IMAGE_PATH,
  kheironShareImage,
  shareImage,
  socialMetadata,
} from "@/lib/share-metadata";

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
    expectLightJpeg(shareImage, SHARE_IMAGE_PATH);
  });

  it("pose la carte Kheiron sur la landing, et seulement là", () => {
    const meta = socialMetadata({
      title: "Masterclass",
      description: "Formation stand-up",
      url: "https://cinemergence.fr/formations/kheiron",
      image: kheironShareImage,
    });

    expect(meta.openGraph).toMatchObject({ images: [kheironShareImage] });
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      images: [kheironShareImage],
    });
    expect(kheironShareImage.url).not.toBe(shareImage.url);
    expectLightJpeg(kheironShareImage, KHEIRON_SHARE_IMAGE_PATH);
  });
});

function expectLightJpeg(
  image: { url: string; type: string; width: number; height: number },
  filePath: string,
) {
  const { size } = statSync(path.join(process.cwd(), "public", filePath));
  expect(image.url).toBe(filePath);
  expect(image.type).toBe("image/jpeg");
  expect(image.width).toBe(1200);
  expect(image.height).toBe(675);
  expect(size).toBeGreaterThan(20_000);
  expect(size).toBeLessThan(300_000);
}
