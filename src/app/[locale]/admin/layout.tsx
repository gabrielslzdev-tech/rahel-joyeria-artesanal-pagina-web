import type { ReactNode } from "react";

// El panel es privado y depende de la sesión: nunca se cachea estáticamente.
export const dynamic = "force-dynamic";

/**
 * Layout del panel interno.
 *
 * 0.3 / sección 17.4: aquí (y en el middleware) se aplicará la verificación
 * de rol en SERVIDOR — `ADMIN` (todo) y `STAFF` (pedidos/producción/inventario).
 * No basta con ocultar botones: cada acción de admin valida rol en el servidor.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh">{children}</div>;
}
