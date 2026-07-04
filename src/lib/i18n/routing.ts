import { defineRouting } from "next-intl/routing";

/**
 * Configuración central de idiomas.
 * Español es el idioma por defecto; el prefijo de locale es SIEMPRE visible
 * en la URL (`/es/…`, `/en/…`) para SEO bilingüe con hreflang (sección 11).
 */
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
