import { expect, test } from "@playwright/test";

test("homepage loads with hero and CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /cinéma|Cinémergence/i,
  );
  await expect(
    page.getByRole("link", { name: /Je réserve ma place/i }).first(),
  ).toBeVisible();
});

test("formations catalog loads", async ({ page }) => {
  await page.goto("/formations");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("formations");
});

test("formation page loads", async ({ page }) => {
  await page.goto("/formations/formation-jouer-face-camera");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page
      .getByRole("link", {
        name: /Voir toutes les sessions|Je pose une question|Je m'inscris|Je me lance/i,
      })
      .first(),
  ).toBeVisible();
});

test("mobile navigation works", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /Menu/i }).or(page.getByLabel(/Menu/i)).first().click();
  await expect(
    page.getByRole("navigation", { name: /mobile/i }).getByRole("link", {
      name: "Financement",
    }),
  ).toBeVisible();
});

test("tablet layout shows formations grid", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/formations");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("article").first()).toBeVisible();
});

test("desktop header nav is visible", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Navigation principale" })).toBeVisible();
});

test("contact page has form", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByLabel(/Nom/i).first()).toBeVisible();
  await expect(page.getByLabel(/Email/i).first()).toBeVisible();
});

test("intervenants page loads", async ({ page }) => {
  await page.goto("/intervenants");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
