import type { Locale } from "@/lib/i18n/routing";

// Tipo de producción (espejo del enum ProductionType del schema).
export type ProductionType = "IN_STOCK" | "MADE_TO_ORDER" | "ONE_OF_A_KIND";

/** Datos de disponibilidad/tiempo para mostrar en ficha, listado y carrito. */
export type Availability = {
  productionType: ProductionType;
  productionDays: number;
  inStock: boolean;
  soldOut: boolean; // pieza única ya vendida / sin stock real
};

/** Imagen lista para render (URL resuelta). */
export type ProductImage = {
  url: string;
  alt: string;
  isScaleShot: boolean;
};

/** Item de listado (grid de catálogo). */
export type ProductListItem = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  price: number;
  currency: string;
  image: ProductImage | null;
  availability: Availability;
  isFeatured: boolean;
  isBestseller: boolean;
  nonReturnable: boolean;
};

/** Opción de personalización lista para render. */
export type CustomizationChoiceView = {
  id: string;
  value: string;
  label: string;
  priceModifier: number;
  timeModifierDays: number;
};

export type CustomizationOptionView = {
  id: string;
  key: string;
  inputType: "TEXT" | "SELECT" | "DATE";
  label: string;
  required: boolean;
  maxLength: number | null;
  priceModifier: number;
  timeModifierDays: number;
  choices: CustomizationChoiceView[];
};

export type ProductVariantView = {
  id: string;
  sku: string;
  options: Record<string, string>;
  price: number | null;
};

/** Ficha de producto completa. */
export type ProductDetail = ProductListItem & {
  description: string | null;
  careInstructions: string | null;
  images: ProductImage[];
  variants: ProductVariantView[];
  customizations: CustomizationOptionView[];
  metaTitle: string | null;
  metaDescription: string | null;
};

export type CatalogFilters = {
  categorySlug?: string;
  collectionSlug?: string;
};

export type LocaleArg = { locale: Locale };
