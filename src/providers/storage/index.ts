/**
 * Contrato StorageProvider (Cloudflare R2 + CDN). Subidas validadas (tipo real
 * y tamaño, nombre regenerado); certificados servidos con URL firmada con
 * expiración (secciones 5, 17.8). Implementación: r2.ts.
 */

export interface UploadUrlInput {
  contentType: string;
  sizeBytes: number;
  keyPrefix: string; // p. ej. "products/", "certificates/"
}

export interface UploadUrl {
  uploadUrl: string;
  key: string; // nombre regenerado, no el original
  publicUrl?: string;
}

export interface StorageProvider {
  readonly name: "r2";
  createUploadUrl(input: UploadUrlInput): Promise<UploadUrl>;
  /** URL firmada con expiración (para certificados/archivos privados). */
  createSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
  delete(key: string): Promise<void>;
}

export function getStorageProvider(): StorageProvider {
  throw new Error("StorageProvider no implementado todavía (F1).");
}
