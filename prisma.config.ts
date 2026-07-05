// Configuración de Prisma (v7). La URL de la base de datos ya NO vive en el
// bloque datasource del schema, sino aquí.
//
// Carga variables desde .env.local (lo que usa Next.js) y .env como fallback,
// así una sola fuente de secretos sirve para la app y para Prisma.
import { config as loadEnv } from "dotenv";
loadEnv({ path: [".env.local", ".env"] });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // El CLI (migraciones) usa la conexión DIRECTA para evitar el pooler.
    // En runtime, el cliente usará DATABASE_URL (pooled) vía driver-adapter (F1).
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
    // Solo en desarrollo: shadow DB para `prisma migrate dev`. En producción
    // (Postgres gestionado) no hace falta; queda undefined y se ignora.
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
  },
});
