import type { ReactNode } from "react";

/**
 * Root layout mínimo. El <html lang> real lo fija el layout de `[locale]`,
 * porque el idioma depende del segmento de ruta.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
