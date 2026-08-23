import { describe, expect, it } from "vitest";

import {
  ADMIN_VIDEO_MAX_EDGE,
  fitAdminVideoSize,
  interviewVideoOptimizeError,
} from "@/lib/optimize-admin-video";

describe("fitAdminVideoSize", () => {
  it("réduit un 4K 16:9 à 1280×720", () => {
    expect(fitAdminVideoSize(3840, 2160)).toEqual({
      width: ADMIN_VIDEO_MAX_EDGE,
      height: 720,
    });
  });

  it("ramène une 1080p à 720p", () => {
    expect(fitAdminVideoSize(1920, 1080)).toEqual({ width: 1280, height: 720 });
  });

  it("ne surexpose pas une 720p", () => {
    expect(fitAdminVideoSize(1280, 720)).toEqual({ width: 1280, height: 720 });
  });

  it("ramène une verticale 1080×1920 à 720×1280", () => {
    expect(fitAdminVideoSize(1080, 1920)).toEqual({ width: 720, height: 1280 });
  });

  it("arrondit aux dimensions paires", () => {
    const size = fitAdminVideoSize(1921, 1080);
    expect(size.width % 2).toBe(0);
    expect(size.height % 2).toBe(0);
    expect(size.width).toBeLessThanOrEqual(ADMIN_VIDEO_MAX_EDGE);
    expect(size.height).toBeLessThanOrEqual(ADMIN_VIDEO_MAX_EDGE);
  });
});

describe("interviewVideoOptimizeError", () => {
  it("explique un codec non encodable", () => {
    expect(interviewVideoOptimizeError("no_encodable_target_codec")).toMatch(/Chrome/);
  });
});
