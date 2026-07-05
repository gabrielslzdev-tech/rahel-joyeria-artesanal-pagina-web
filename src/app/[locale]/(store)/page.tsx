import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { listFeaturedProducts } from "@/modules/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";

// Lee la DB (destacados) → dinámico. En F1 se optimiza con ISR/revalidate.
export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [t, tc, featured] = await Promise.all([
    getTranslations("home"),
    getTranslations("catalog"),
    listFeaturedProducts(locale, 4),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="flex flex-col items-center gap-6 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h1>
        <p className="max-w-2xl text-lg text-neutral-600">{t("subtitle")}</p>
        <Link
          href="/tienda"
          className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          {t("cta")}
        </Link>
      </section>

      {featured.length > 0 && (
        <section className="py-12">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold">{tc("featuredTitle")}</h2>
            <Link href="/tienda" className="text-sm underline underline-offset-4">
              {tc("viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
