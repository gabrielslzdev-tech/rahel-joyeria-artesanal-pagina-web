import { test, expect } from "@playwright/test";

/**
 * Smoke test de fundación: la home responde y redirige al locale por defecto.
 * El flujo crítico de compra se agrega en F1.
 */
test("la home en español carga", async ({ page }) => {
  await page.goto("/es");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("/ redirige a un locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(es|en)$/);
});
