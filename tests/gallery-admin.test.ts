import { describe, expect, it } from "vitest";

import {
  ADMIN_GALLERY_VIDEO_MAX_BYTES,
  partitionAdminGalleryImages,
  validateAdminGalleryFile,
} from "@/lib/admin-gallery-upload";
import {
  DEFAULT_GALLERY_PHOTO_ALT,
  GALLERY_INTERVIEW_CATEGORY,
  GALLERY_PLATEAU_CATEGORIES,
  MAX_GALLERY_PHOTO_BATCH,
} from "@/lib/gallery-admin";
import { isInterviewObjectFilename } from "@/lib/gallery-s3-upload";

describe("catégories galerie CMS", () => {
  it("sépare plateau / livrable et interviews", () => {
    expect(GALLERY_PLATEAU_CATEGORIES).toEqual(["plateau", "livrable"]);
    expect(GALLERY_INTERVIEW_CATEGORY).toBe("interview");
    expect(DEFAULT_GALLERY_PHOTO_ALT.length).toBeGreaterThan(1);
    expect(MAX_GALLERY_PHOTO_BATCH).toBeGreaterThan(1);
  });
});

describe("partitionAdminGalleryImages", () => {
  it("garde les jpeg valides et ignore le reste", () => {
    const { accepted, rejectedCount } = partitionAdminGalleryImages([
      { type: "image/jpeg", size: 1200 },
      { type: "image/png", size: 800 },
      { type: "video/mp4", size: 2000 },
      { type: "image/jpeg", size: 0 },
    ]);
    expect(accepted).toEqual([
      { type: "image/jpeg", size: 1200 },
      { type: "image/png", size: 800 },
    ]);
    expect(rejectedCount).toBe(2);
  });
});

describe("vidéos interview", () => {
  it("accepte jusqu’à 2 Go", () => {
    expect(
      validateAdminGalleryFile({
        type: "video/mp4",
        size: ADMIN_GALLERY_VIDEO_MAX_BYTES,
      }).ok,
    ).toBe(true);
    expect(
      validateAdminGalleryFile({
        type: "video/mp4",
        size: ADMIN_GALLERY_VIDEO_MAX_BYTES + 1,
      }).ok,
    ).toBe(false);
  });

  it("reconnaît les noms d’objets interview", () => {
    expect(
      isInterviewObjectFilename("interview-96c719ff-cbb6-42b9-8db0-3c0dc6560dc6.mp4"),
    ).toBe(true);
    expect(isInterviewObjectFilename("gallery/foo.mp4")).toBe(false);
  });
});
