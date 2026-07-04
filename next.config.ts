import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fija la raíz del proyecto: evita que Next infiera mal el workspace cuando
  // existe otro package-lock.json en directorios superiores.
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  // Los medios (imágenes/video) se sirven desde Cloudflare R2 vía CDN.
  // Los remotePatterns se completan cuando se configure el StorageProvider.
  images: {
    remotePatterns: [],
  },
};

export default withNextIntl(nextConfig);
