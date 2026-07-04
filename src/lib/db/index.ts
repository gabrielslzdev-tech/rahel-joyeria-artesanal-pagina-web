// Cliente Prisma (singleton). Se implementa en el Paso 0.2, tras revisar el
// schema.prisma. Patrón previsto: instancia única cacheada en globalThis para
// evitar múltiples conexiones en desarrollo (hot-reload de Next).
//
// export const db = globalThis.prisma ?? new PrismaClient();
export {};
