// Seed de datos FICTICIOS para desarrollo (Creaciones Rahel).
// El cliente cargará productos, fotos y cantidades reales al final; esto solo
// sirve para maquetar y probar. Es idempotente: limpia y recrea en cada corrida.
//
// Se ejecuta con: npm run db:seed   (carga .env.local vía prisma.config)
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const img = (slug: string) => `/placeholders/${slug}.svg`;
const SCALE = "/placeholders/scale.svg";

async function wipe() {
  const rows = await db.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  const list = rows.map((r) => `"${r.tablename}"`).join(", ");
  if (list) await db.$executeRawUnsafe(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
}

async function main() {
  await wipe();

  // --- Usuarios (contraseña de desarrollo: Rahel1234!) ---------------------
  const passwordHash = await bcrypt.hash("Rahel1234!", 12);
  await db.user.create({
    data: { id: "usr_admin", name: "Admin Rahel", email: "admin@rahel.mx", passwordHash, role: "ADMIN" },
  });
  await db.user.create({
    data: { id: "usr_staff", name: "Staff Rahel", email: "staff@rahel.mx", passwordHash, role: "STAFF" },
  });
  await db.user.create({
    data: {
      id: "usr_cliente",
      name: "Cliente Demo",
      email: "cliente@rahel.mx",
      passwordHash,
      role: "CUSTOMER",
      customer: { create: { id: "cus_demo", email: "cliente@rahel.mx", firstName: "Cliente", lastName: "Demo" } },
    },
  });

  // --- Atributos facetados (para filtros) ----------------------------------
  const attrs: Record<string, { key: string; label: object; values: { id: string; value: string; label: object; hexColor?: string }[] }> = {
    material: {
      key: "material",
      label: { es: "Material", en: "Material" },
      values: [
        { id: "av_mat_plata", value: "plata", label: { es: "Plata", en: "Silver" } },
        { id: "av_mat_acero", value: "acero", label: { es: "Acero inoxidable", en: "Stainless steel" } },
        { id: "av_mat_oro", value: "oro-laminado", label: { es: "Oro laminado", en: "Gold-filled" } },
      ],
    },
    stone: {
      key: "stone",
      label: { es: "Piedra", en: "Stone" },
      values: [
        { id: "av_sto_cuarzo", value: "cuarzo-rosa", label: { es: "Cuarzo rosa", en: "Rose quartz" } },
        { id: "av_sto_amatista", value: "amatista", label: { es: "Amatista", en: "Amethyst" } },
        { id: "av_sto_onix", value: "onix", label: { es: "Ónix", en: "Onyx" } },
        { id: "av_sto_cristal", value: "cristal", label: { es: "Cristal", en: "Crystal" } },
      ],
    },
    color: {
      key: "color",
      label: { es: "Color", en: "Color" },
      values: [
        { id: "av_col_plateado", value: "plateado", label: { es: "Plateado", en: "Silver" }, hexColor: "#c0c0c0" },
        { id: "av_col_dorado", value: "dorado", label: { es: "Dorado", en: "Gold" }, hexColor: "#d4af37" },
        { id: "av_col_rosa", value: "rosa", label: { es: "Rosa", en: "Pink" }, hexColor: "#e8b4c4" },
        { id: "av_col_negro", value: "negro", label: { es: "Negro", en: "Black" }, hexColor: "#2b2b2b" },
      ],
    },
  };
  for (const a of Object.values(attrs)) {
    await db.attribute.create({
      data: {
        key: a.key,
        label: a.label,
        values: { create: a.values.map((v) => ({ id: v.id, value: v.value, label: v.label, hexColor: v.hexColor })) },
      },
    });
  }

  // --- Categorías ----------------------------------------------------------
  const categories: { id: string; es: string; en: string; slugEs: string; slugEn: string }[] = [
    { id: "cat_bodas", es: "Bodas", en: "Weddings", slugEs: "bodas", slugEn: "weddings" },
    { id: "cat_espiritual", es: "Espiritual", en: "Spiritual", slugEs: "espiritual", slugEn: "spiritual" },
    { id: "cat_minimalista", es: "Minimalista", en: "Minimalist", slugEs: "minimalista", slugEn: "minimalist" },
    { id: "cat_bohemia", es: "Bohemia", en: "Bohemian", slugEs: "bohemia", slugEn: "bohemian" },
    { id: "cat_infantil", es: "Infantil", en: "Kids", slugEs: "infantil", slugEn: "kids" },
  ];
  for (const [i, c] of categories.entries()) {
    await db.category.create({
      data: {
        id: c.id,
        position: i,
        translations: {
          create: [
            { locale: "es", name: c.es, slug: c.slugEs },
            { locale: "en", name: c.en, slug: c.slugEn },
          ],
        },
      },
    });
  }

  // --- Colecciones ---------------------------------------------------------
  const collections: { id: string; es: string; en: string; slugEs: string; slugEn: string; featured?: boolean }[] = [
    { id: "col_tecate", es: "Colección Tecate", en: "Tecate Collection", slugEs: "coleccion-tecate", slugEn: "tecate-collection", featured: true },
    { id: "col_novia", es: "Novia", en: "Bride", slugEs: "novia", slugEn: "bride" },
  ];
  for (const [i, c] of collections.entries()) {
    await db.collection.create({
      data: {
        id: c.id,
        position: i,
        isFeatured: c.featured ?? false,
        translations: {
          create: [
            { locale: "es", name: c.es, slug: c.slugEs },
            { locale: "en", name: c.en, slug: c.slugEn },
          ],
        },
      },
    });
  }

  // --- Productos -----------------------------------------------------------
  type Prod = {
    id: string;
    sku: string;
    type: "IN_STOCK" | "MADE_TO_ORDER" | "ONE_OF_A_KIND";
    price: number;
    productionDays: number;
    nonReturnable?: boolean;
    featured?: boolean;
    bestseller?: boolean;
    stock: number;
    image: string;
    categories: string[];
    collections?: string[];
    attributeValues: string[];
    es: { name: string; slug: string; short: string };
    en: { name: string; slug: string; short: string };
  };

  const products: Prod[] = [
    {
      id: "prod_pulsera_cuarzo", sku: "PUL-CUA-001", type: "IN_STOCK", price: 450, productionDays: 0,
      featured: true, bestseller: true, stock: 15, image: "pulsera-cuarzo",
      categories: ["cat_espiritual", "cat_minimalista"], collections: ["col_tecate"],
      attributeValues: ["av_mat_plata", "av_sto_cuarzo", "av_col_rosa"],
      es: { name: "Pulsera de Cuarzo Rosa", slug: "pulsera-cuarzo-rosa", short: "Pulsera artesanal con cuarzo rosa natural y plata .925." },
      en: { name: "Rose Quartz Bracelet", slug: "rose-quartz-bracelet", short: "Handmade bracelet with natural rose quartz and .925 silver." },
    },
    {
      id: "prod_collar_plata", sku: "COL-PLA-002", type: "MADE_TO_ORDER", price: 890, productionDays: 7,
      featured: true, stock: 0, image: "collar-plata",
      categories: ["cat_minimalista"], collections: ["col_tecate"],
      attributeValues: ["av_mat_plata", "av_col_plateado"],
      es: { name: "Collar Minimalista de Plata", slug: "collar-minimalista-plata", short: "Collar de plata .925 hecho a mano, elegante y ligero." },
      en: { name: "Minimalist Silver Necklace", slug: "minimalist-silver-necklace", short: "Handmade .925 silver necklace, elegant and light." },
    },
    {
      id: "prod_aretes_cristal", sku: "ARE-CRI-003", type: "IN_STOCK", price: 320, productionDays: 0,
      bestseller: true, stock: 30, image: "aretes-cristal",
      categories: ["cat_bohemia"],
      attributeValues: ["av_mat_acero", "av_sto_cristal", "av_col_dorado"],
      es: { name: "Aretes de Cristal Bohemia", slug: "aretes-cristal-bohemia", short: "Aretes bohemios con cristales y baño dorado." },
      en: { name: "Bohemian Crystal Earrings", slug: "bohemian-crystal-earrings", short: "Bohemian earrings with crystals and gold finish." },
    },
    {
      id: "prod_anillo_plata", sku: "ANI-PLA-004", type: "MADE_TO_ORDER", price: 650, productionDays: 5,
      stock: 0, image: "anillo-plata",
      categories: ["cat_minimalista"],
      attributeValues: ["av_mat_plata", "av_col_plateado"],
      es: { name: "Anillo de Plata Grabable", slug: "anillo-plata-grabable", short: "Anillo de plata .925 que puedes personalizar con grabado." },
      en: { name: "Engravable Silver Ring", slug: "engravable-silver-ring", short: ".925 silver ring you can personalize with engraving." },
    },
    {
      id: "prod_tiara_novia", sku: "TIA-NOV-005", type: "ONE_OF_A_KIND", price: 3200, productionDays: 0,
      featured: true, stock: 1, image: "tiara-novia",
      categories: ["cat_bodas"], collections: ["col_novia"],
      attributeValues: ["av_mat_plata", "av_sto_cristal"],
      es: { name: "Tiara de Novia (Pieza Única)", slug: "tiara-novia-pieza-unica", short: "Tiara única hecha a mano con cristales, para el gran día." },
      en: { name: "Bridal Tiara (One of a Kind)", slug: "bridal-tiara-one-of-a-kind", short: "One-of-a-kind handmade tiara with crystals, for the big day." },
    },
    {
      id: "prod_pulsera_personalizada", sku: "PUL-PER-006", type: "MADE_TO_ORDER", price: 380, productionDays: 4,
      nonReturnable: true, stock: 0, image: "pulsera-personalizada",
      categories: ["cat_infantil"], collections: ["col_tecate"],
      attributeValues: ["av_mat_plata", "av_sto_cuarzo"],
      es: { name: "Pulsera Personalizada con Nombre", slug: "pulsera-personalizada-nombre", short: "Pulsera con nombre grabado y piedra a elección." },
      en: { name: "Personalized Name Bracelet", slug: "personalized-name-bracelet", short: "Bracelet with engraved name and stone of choice." },
    },
  ];

  for (const p of products) {
    await db.product.create({
      data: {
        id: p.id,
        sku: p.sku,
        productionType: p.type,
        status: "ACTIVE",
        basePrice: p.price,
        productionDays: p.productionDays,
        nonReturnable: p.nonReturnable ?? false,
        isFeatured: p.featured ?? false,
        isBestseller: p.bestseller ?? false,
        publishedAt: new Date(),
        translations: {
          create: [
            { locale: "es", name: p.es.name, slug: p.es.slug, shortDescription: p.es.short, description: p.es.short },
            { locale: "en", name: p.en.name, slug: p.en.slug, shortDescription: p.en.short, description: p.en.short },
          ],
        },
        media: {
          create: [
            { storageKey: img(p.image), type: "IMAGE", isPrimary: true, position: 0, alt: { es: p.es.name, en: p.en.name } },
            { storageKey: SCALE, type: "IMAGE", isScaleShot: true, position: 1, alt: { es: "Foto de escala", en: "Scale photo" } },
          ],
        },
        categories: { connect: p.categories.map((id) => ({ id })) },
        collections: p.collections ? { connect: p.collections.map((id) => ({ id })) } : undefined,
        attributeValues: { connect: p.attributeValues.map((id) => ({ id })) },
        inventoryItems: {
          create: [{ quantityOnHand: p.stock, reorderLevel: p.type === "IN_STOCK" ? 5 : 0 }],
        },
      },
    });
  }

  // Variantes de talla para el anillo (MADE_TO_ORDER).
  for (const talla of ["6", "7", "8"]) {
    await db.productVariant.create({
      data: {
        productId: "prod_anillo_plata",
        sku: `ANI-PLA-004-T${talla}`,
        options: { talla },
        inventoryItem: { create: { productId: "prod_anillo_plata", quantityOnHand: 0 } },
      },
    });
  }

  // Personalización: grabado en el anillo.
  await db.customizationOption.create({
    data: {
      productId: "prod_anillo_plata",
      key: "grabado",
      inputType: "TEXT",
      label: { es: "Grabado", en: "Engraving" },
      required: false,
      maxLength: 15,
      priceModifier: 0,
      timeModifierDays: 2,
    },
  });

  // Personalización: nombre + piedra en la pulsera personalizada.
  await db.customizationOption.create({
    data: {
      productId: "prod_pulsera_personalizada",
      key: "nombre",
      inputType: "TEXT",
      label: { es: "Nombre a grabar", en: "Name to engrave" },
      required: true,
      maxLength: 12,
      priceModifier: 80,
      timeModifierDays: 1,
    },
  });
  await db.customizationOption.create({
    data: {
      productId: "prod_pulsera_personalizada",
      key: "piedra",
      inputType: "SELECT",
      label: { es: "Piedra", en: "Stone" },
      required: true,
      choices: {
        create: [
          { value: "cuarzo-rosa", label: { es: "Cuarzo rosa", en: "Rose quartz" }, priceModifier: 0, position: 0 },
          { value: "amatista", label: { es: "Amatista", en: "Amethyst" }, priceModifier: 40, timeModifierDays: 1, position: 1 },
          { value: "onix", label: { es: "Ónix", en: "Onyx" }, priceModifier: 40, timeModifierDays: 1, position: 2 },
        ],
      },
    },
  });

  const counts = {
    usuarios: await db.user.count(),
    productos: await db.product.count(),
    categorias: await db.category.count(),
    colecciones: await db.collection.count(),
    atributos: await db.attributeValue.count(),
    variantes: await db.productVariant.count(),
    personalizacion: await db.customizationOption.count(),
    inventario: await db.inventoryItem.count(),
  };
  console.log("Seed completado:", counts);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
