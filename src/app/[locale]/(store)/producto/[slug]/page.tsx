import { cache } from "react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/lib/i18n/routing";
import { formatMoney } from "@/lib/utils/format";
import { getProductBySlug } from "@/modules/catalog";
import { ProductImage } from "@/components/catalog/ProductImage";
import { AvailabilityBadge } from "@/components/catalog/AvailabilityBadge";

export const dynamic = "force-dynamic";

// Memoiza la carga por request: generateMetadata y la página comparten la query.
const loadProduct = cache((locale: Locale, slug: string) => getProductBySlug(locale, slug));

type PageParams = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const product = await loadProduct(locale, slug);
  if (!product) return {};
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.shortDescription ?? undefined,
  };
}

export default async function ProductPage({ params }: PageParams) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const product = await loadProduct(locale, slug);
  if (!product) notFound();

  const t = await getTranslations("catalog");
  const money = (n: number) => formatMoney(n, { locale, currency: product.currency });

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        t("whatsappMessage", { product: product.name }),
      )}`
    : null;

  const [primary, ...rest] = product.images;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Galería */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
            {primary && <ProductImage src={primary.url} alt={primary.alt} sizes="(max-width: 768px) 100vw, 50vw" priority />}
          </div>
          {rest.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((im, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
                  <ProductImage src={im.url} alt={im.alt} sizes="25vw" />
                  {im.isScaleShot && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                      {t("scalePhoto")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
            <p className="text-2xl font-semibold">{money(product.price)}</p>
            <div className="flex items-center gap-2">
              <AvailabilityBadge availability={product.availability} />
              <span className="text-xs text-neutral-500">{t("shippingNote")}</span>
            </div>
            {product.nonReturnable && (
              <p className="text-xs font-medium text-amber-700">{t("nonReturnable")}</p>
            )}
          </div>

          {product.description && (
            <p className="text-neutral-700">{product.description}</p>
          )}

          {/* Variantes (display; el carrito llega en el siguiente módulo) */}
          {product.variants.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium text-neutral-900">{t("variants")}</h2>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <span key={v.id} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm">
                    {Object.values(v.options).join(" · ") || v.sku}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Personalización (display; el configurador interactivo es F3) */}
          {product.customizations.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-neutral-900">{t("customization")}</h2>
              {product.customizations.map((o) => (
                <div key={o.id} className="rounded-lg border border-neutral-200 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{o.label}</span>
                    <span className="text-xs text-neutral-500">
                      {o.priceModifier > 0 && t("priceEffect", { amount: money(o.priceModifier) })}
                      {o.timeModifierDays > 0 && ` ${t("timeEffect", { days: o.timeModifierDays })}`}
                    </span>
                  </div>
                  {o.choices.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {o.choices.map((c) => (
                        <span key={c.id} className="rounded-md bg-neutral-100 px-2 py-1 text-xs">
                          {c.label}
                          {c.priceModifier > 0 && ` (${t("priceEffect", { amount: money(c.priceModifier) })})`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-green-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-700"
            >
              {t("whatsappCta")}
            </a>
          )}

          {product.careInstructions && (
            <div className="mt-4 border-t border-neutral-200 pt-4">
              <h2 className="text-sm font-medium text-neutral-900">{t("care")}</h2>
              <p className="mt-1 text-sm text-neutral-600">{product.careInstructions}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
