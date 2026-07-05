import Image from "next/image";

/**
 * Imagen de producto. Por ahora `unoptimized` para servir los placeholders SVG
 * de desarrollo sin configuración extra. En F1, al integrar Cloudflare R2, se
 * habilita la optimización de next/image + remotePatterns para las fotos reales.
 */
export function ProductImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized
      className="object-cover"
    />
  );
}
