import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    // Solo pruebas unitarias/integración de lógica de negocio.
    // Los e2e (Playwright) viven en tests/e2e y se excluyen aquí.
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
