import { afterEach, describe, expect, it } from "vitest";

import { getPublicSiteUrl } from "@/lib/site-url";

describe("getPublicSiteUrl", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("uses NEXT_PUBLIC_SITE_URL when set", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://cinemergence.fr/";
    expect(getPublicSiteUrl()).toBe("https://cinemergence.fr");
  });

  it("falls back to defaultSite url", () => {
    expect(getPublicSiteUrl()).toBe("https://cinemergence.fr");
  });
});
