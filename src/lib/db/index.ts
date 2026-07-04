import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Cliente Prisma (singleton) sobre driver-adapter de Postgres.
 *
 * Prisma 7 requiere un driver-adapter (ya no acepta una url directa). Usamos
 * `@prisma/adapter-pg`, que funciona igual en dev local y en producción
 * (Neon/Supabase). La conexión se toma de DATABASE_URL (pooled en producción).
 *
 * Se cachea en globalThis para evitar múltiples conexiones durante el
 * hot-reload de Next en desarrollo. El pool es perezoso: no conecta al importar,
 * solo al ejecutar la primera query.
 *
 * Las migraciones (CLI) usan la conexión DIRECTA vía prisma.config.ts.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
