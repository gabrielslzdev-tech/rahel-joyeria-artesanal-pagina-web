import type { routing } from "@/lib/i18n/routing";
import type messages from "../messages/es.json";

// Tipado global de next-intl: da autocompletado de llaves y valida el locale.
// `es.json` es la fuente de verdad de las llaves de traducción.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
