import { defineConfig, devices } from "@playwright/test";

/**
 * E2E del flujo crítico (sección 18): catálogo → carrito → checkout → pago
 * (sandbox) → confirmación. Los specs se agregan conforme se construyen los
 * módulos de F1.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // La mayoría del tráfico será móvil (sección 18): validar también móvil.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
