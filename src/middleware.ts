import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

/**
 * Middleware de i18n: detecta/negocia el locale y reescribe las rutas.
 *
 * NOTA (0.3+): aquí se encadenará la protección de rol para `/admin`
 * (sección 14 y 17.4). Se compondrá con este middleware, no lo reemplazará.
 */
export default createMiddleware(routing);

export const config = {
  // Aplica a todo excepto rutas internas, API y archivos con extensión.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
