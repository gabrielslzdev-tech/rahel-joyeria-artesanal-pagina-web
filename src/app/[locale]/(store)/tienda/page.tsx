import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { listCategories, listProducts } from "@/modules/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const { categoria } = await searchParams;
  const [t, products, categories] = await Promise.all([
    getTranslations("catalog"),
    listProducts(locale, { categorySlug: categoria }),
    listCategories(locale),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-neutral-600">{t("subtitle")}</p>
      </header>

      <nav className="mb-8 flex flex-wrap gap-2">
        <FilterChip href="/tienda" active={!categoria} label={t("all")} />
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            href={`/tienda?categoria=${c.slug}`}
            active={categoria === c.slug}
            label={c.name}
          />
        ))}
      </nav>

      {products.length === 0 ? (
        <p className="py-16 text-center text-neutral-500">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-1.5 text-sm transition ${
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
      }`}
    >
      {label}
    </Link>
  );
}
