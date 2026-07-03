import { expect, test } from "@playwright/test";

test("homepage loads with hero and CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("cinéma");
  await expect(page.getByRole("link", { name: /Je me lance/i }).first()).toBeVisible();
});

test("formation page loads", async ({ page }) => {
  await page.goto("/formation-jouer-face-camera");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Jouer face caméra");
  await expect(page.getByRole("link", { name: /Je m'inscris/i }).first()).toBeVisible();
});

test("mobile navigation works", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByLabel("Ouvrir le menu").click();
  await expect(page.getByRole("link", { name: "Financement" })).toBeVisible();
});

test("contact page has form", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByLabel("Nom *")).toBeVisible();
  await expect(page.getByLabel("Email *")).toBeVisible();
});
