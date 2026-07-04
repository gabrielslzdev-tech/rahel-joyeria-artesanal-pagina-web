import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Wrappers de navegación conscientes del locale.
 * Usa SIEMPRE estos en lugar de los de `next/link` / `next/navigation`
 * para que las rutas conserven el prefijo de idioma.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
