import { describe, expect, it } from "vitest";
import sharp from "sharp";

import {
  ADMIN_IMAGE_MAX_EDGE,
  OPTIMIZED_IMAGE_EXT,
  OPTIMIZED_IMAGE_MIME,
  optimizeAdminImage,
} from "@/lib/optimize-admin-image";

describe("optimizeAdminImage", () => {
  it("réduit un grand PNG en JPEG ≤ 1920px", async () => {
    const source = await sharp({
      create: {
        width: 2400,
        height: 1800,
        channels: 3,
        background: { r: 40, g: 30, b: 20 },
      },
    })
      .png()
      .toBuffer();

    const optimized = await optimizeAdminImage(source);

    expect(optimized.mime).toBe(OPTIMIZED_IMAGE_MIME);
    expect(optimized.ext).toBe(OPTIMIZED_IMAGE_EXT);
    expect(optimized.buffer.subarray(0, 2).equals(Buffer.from([0xff, 0xd8]))).toBe(
      true,
    );
    expect(optimized.width).toBeLessThanOrEqual(ADMIN_IMAGE_MAX_EDGE);
    expect(optimized.height).toBeLessThanOrEqual(ADMIN_IMAGE_MAX_EDGE);
    expect(optimized.width).toBe(ADMIN_IMAGE_MAX_EDGE);
    expect(optimized.height).toBe(1440);
  });

  it("ne surexpose pas une petite image", async () => {
    const source = await sharp({
      create: {
        width: 320,
        height: 240,
        channels: 3,
        background: { r: 10, g: 12, b: 18 },
      },
    })
      .jpeg()
      .toBuffer();

    const optimized = await optimizeAdminImage(source);
    expect(optimized.width).toBe(320);
    expect(optimized.height).toBe(240);
  });
});
