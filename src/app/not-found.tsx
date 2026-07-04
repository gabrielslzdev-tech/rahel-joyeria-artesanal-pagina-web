import Link from "next/link";
import "./globals.css";

/**
 * not-found de nivel raíz (rutas fuera de cualquier locale válido).
 * Debe renderizar <html>/<body> porque el root layout no los provee.
 */
export default function GlobalNotFound() {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-3xl font-semibold">404</h1>
          <p className="text-neutral-600">Página no encontrada / Page not found</p>
          <Link href="/es" className="text-sm font-medium underline underline-offset-4">
            Inicio / Home
          </Link>
        </main>
      </body>
    </html>
  );
}
