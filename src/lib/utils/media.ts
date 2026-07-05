/**
 * Resuelve la URL pública de un medio a partir de su `storageKey`.
 *
 * - En desarrollo, el seed usa placeholders locales ("/placeholders/x.svg").
 * - En producción, los medios viven en Cloudflare R2; se antepone R2_PUBLIC_URL.
 *
 * Las claves que empiezan con "/" o "http" se devuelven tal cual.
 */
export function mediaUrl(storageKey: string): string {
  if (storageKey.startsWith("/") || storageKey.startsWith("http")) {
    return storageKey;
  }
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, "") ?? "";
  return `${base}/${storageKey}`;
}
