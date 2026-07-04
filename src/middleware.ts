import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "@/lib/i18n/routing";
import { auth } from "@/lib/auth/edge";
import { canAccessAdmin } from "@/lib/auth/roles";

const intlMiddleware = createIntlMiddleware(routing);

// Detecta rutas de admin con prefijo de locale: /es/admin, /en/admin/...
const localePattern = routing.locales.join("|");
const ADMIN_RE = new RegExp(`^/(${localePattern})/admin(/|$)`);

/**
 * Middleware compuesto: primero protege `/admin` por ROL (sección 17.4),
 * luego delega en el middleware de i18n para el resto (negociación de locale).
 *
 * `auth(...)` inyecta `req.auth` leyendo el JWT (edge, sin DB). La verificación
 * de rol también se repite en servidor en cada acción sensible (requireRole).
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (ADMIN_RE.test(pathname)) {
    const locale = pathname.split("/")[1] || routing.defaultLocale;
    const role = req.auth?.user?.role;

    if (!role) {
      // No autenticado → a login, conservando destino.
      const url = new URL(`/${locale}/login`, req.nextUrl);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    if (!canAccessAdmin(role)) {
      // Autenticado pero sin permiso (CUSTOMER) → a la tienda.
      return NextResponse.redirect(new URL(`/${locale}`, req.nextUrl));
    }
  }

  return intlMiddleware(req);
});

export const config = {
  // Aplica a todo excepto rutas internas, API y archivos con extensión.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
