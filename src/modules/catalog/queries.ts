import { db } from "@/lib/db";
import { mediaUrl } from "@/lib/utils/media";
import type { Locale } from "@/lib/i18n/routing";
import type {
  Availability,
  CatalogFilters,
  CustomizationOptionView,
  ProductDetail,
  ProductImage,
  ProductListItem,
  ProductionType,
  ProductVariantView,
} from "./types";

// Extrae el texto del locale desde un campo Json { es, en }.
function pickLocale(json: unknown, locale: Locale): string {
  if (json && typeof json === "object" && !Array.isArray(json)) {
    const rec = json as Record<string, unknown>;
    const v = rec[locale] ?? rec.es ?? Object.values(rec)[0];
    return typeof v === "string" ? v : "";
  }
  return typeof json === "string" ? json : "";
}

function computeAvailability(
  productionType: ProductionType,
  totalStock: number,
): Availability {
  const inStock = totalStock > 0;
  const soldOut = productionType !== "MADE_TO_ORDER" && totalStock <= 0;
  return { productionType, productionDays: 0, inStock, soldOut };
}

// Selección común para listar productos.
const listSelect = {
  translations: true,
  media: { orderBy: { position: "asc" } },
  inventoryItems: true,
} as const;

type ProductWithRelations = {
  id: string;
  productionType: ProductionType;
  productionDays: number;
  basePrice: unknown;
  currency: string;
  isFeatured: boolean;
  isBestseller: boolean;
  nonReturnable: boolean;
  translations: {
    locale: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    description: string | null;
    careInstructions: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
  }[];
  media: { storageKey: string; alt: unknown; isScaleShot: boolean }[];
  inventoryItems: { quantityOnHand: number }[];
};

function toImage(m: ProductWithRelations["media"][number], locale: Locale): ProductImage {
  return {
    url: mediaUrl(m.storageKey),
    alt: pickLocale(m.alt, locale),
    isScaleShot: m.isScaleShot,
  };
}

function toListItem(p: ProductWithRelations, locale: Locale): ProductListItem | null {
  const tr = p.translations.find((t) => t.locale === locale) ?? p.translations[0];
  if (!tr) return null;

  const totalStock = p.inventoryItems.reduce((sum, i) => sum + i.quantityOnHand, 0);
  const availability = computeAvailability(p.productionType, totalStock);
  availability.productionDays = p.productionDays;

  const primary = p.media.find((m) => !m.isScaleShot) ?? p.media[0] ?? null;

  return {
    id: p.id,
    slug: tr.slug,
    name: tr.name,
    shortDescription: tr.shortDescription,
    price: Number(p.basePrice),
    currency: p.currency,
    image: primary ? toImage(primary, locale) : null,
    availability,
    isFeatured: p.isFeatured,
    isBestseller: p.isBestseller,
    nonReturnable: p.nonReturnable,
  };
}

/** Lista de productos activos para el catálogo, con filtros opcionales. */
export async function listProducts(
  locale: Locale,
  filters: CatalogFilters = {},
): Promise<ProductListItem[]> {
  const products = (await db.product.findMany({
    where: {
      status: "ACTIVE",
      translations: { some: { locale } },
      ...(filters.categorySlug
        ? { categories: { some: { translations: { some: { locale, slug: filters.categorySlug } } } } }
        : {}),
      ...(filters.collectionSlug
        ? { collections: { some: { translations: { some: { locale, slug: filters.collectionSlug } } } } }
        : {}),
    },
    include: listSelect,
    orderBy: [{ isBestseller: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
  })) as unknown as ProductWithRelations[];

  return products.map((p) => toListItem(p, locale)).filter((x): x is ProductListItem => x !== null);
}

/** Productos destacados para el home. */
export async function listFeaturedProducts(
  locale: Locale,
  take = 4,
): Promise<ProductListItem[]> {
  const products = (await db.product.findMany({
    where: { status: "ACTIVE", isFeatured: true, translations: { some: { locale } } },
    include: listSelect,
    orderBy: { createdAt: "desc" },
    take,
  })) as unknown as ProductWithRelations[];

  return products.map((p) => toListItem(p, locale)).filter((x): x is ProductListItem => x !== null);
}

/** Ficha completa de producto por slug (del locale). */
export async function getProductBySlug(
  locale: Locale,
  slug: string,
): Promise<ProductDetail | null> {
  const product = (await db.product.findFirst({
    where: { status: "ACTIVE", translations: { some: { locale, slug } } },
    include: {
      ...listSelect,
      variants: { where: { isActive: true }, orderBy: { position: "asc" } },
      customizationOptions: {
        orderBy: { position: "asc" },
        include: { choices: { orderBy: { position: "asc" } } },
      },
    },
  })) as unknown as
    | (ProductWithRelations & {
        variants: { id: string; sku: string; options: unknown; priceOverride: unknown }[];
        customizationOptions: {
          id: string;
          key: string;
          inputType: "TEXT" | "SELECT" | "DATE";
          label: unknown;
          required: boolean;
          maxLength: number | null;
          priceModifier: unknown;
          timeModifierDays: number;
          choices: {
            id: string;
            value: string;
            label: unknown;
            priceModifier: unknown;
            timeModifierDays: number;
          }[];
        }[];
      })
    | null;

  if (!product) return null;

  const base = toListItem(product, locale);
  if (!base) return null;

  const tr = product.translations.find((t) => t.locale === locale) ?? product.translations[0]!;

  const images: ProductImage[] = product.media.map((m) => toImage(m, locale));

  const variants: ProductVariantView[] = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    options: (v.options as Record<string, string>) ?? {},
    price: v.priceOverride != null ? Number(v.priceOverride) : null,
  }));

  const customizations: CustomizationOptionView[] = product.customizationOptions.map((o) => ({
    id: o.id,
    key: o.key,
    inputType: o.inputType,
    label: pickLocale(o.label, locale),
    required: o.required,
    maxLength: o.maxLength,
    priceModifier: Number(o.priceModifier),
    timeModifierDays: o.timeModifierDays,
    choices: o.choices.map((c) => ({
      id: c.id,
      value: c.value,
      label: pickLocale(c.label, locale),
      priceModifier: Number(c.priceModifier),
      timeModifierDays: c.timeModifierDays,
    })),
  }));

  return {
    ...base,
    description: tr.description,
    careInstructions: tr.careInstructions,
    metaTitle: tr.metaTitle,
    metaDescription: tr.metaDescription,
    images,
    variants,
    customizations,
  };
}

/** Categorías activas para navegación/filtros. */
export async function listCategories(locale: Locale) {
  const categories = await db.category.findMany({
    where: { isActive: true, translations: { some: { locale } } },
    include: { translations: { where: { locale } } },
    orderBy: { position: "asc" },
  });
  return categories
    .map((c) => {
      const tr = c.translations[0];
      return tr ? { id: c.id, slug: tr.slug, name: tr.name } : null;
    })
    .filter((x): x is { id: string; slug: string; name: string } => x !== null);
}
