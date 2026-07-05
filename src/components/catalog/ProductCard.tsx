import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { formatMoney } from "@/lib/utils/format";
import type { Locale } from "@/lib/i18n/routing";
import type { ProductListItem } from "@/modules/catalog";
import { ProductImage } from "./ProductImage";
import { AvailabilityBadge } from "./AvailabilityBadge";

export function ProductCard({ product }: { product: ProductListItem }) {
  const t = useTranslations("catalog");
  const locale = useLocale() as Locale;

  return (
    <Link href={`/producto/${product.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
        {product.image ? (
          <ProductImage src={product.image.url} alt={product.image.alt} />
        ) : null}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isBestseller && (
            <span className="rounded-full bg-neutral-900/85 px-2 py-0.5 text-[11px] font-medium text-white">
              {t("bestseller")}
            </span>
          )}
          {product.nonReturnable && (
            <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[11px] font-medium text-white">
              {t("personalizable")}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-neutral-900 group-hover:underline">
          {product.name}
        </h3>
        <p className="text-base font-semibold text-neutral-900">
          {formatMoney(product.price, { locale, currency: product.currency })}
        </p>
        <AvailabilityBadge availability={product.availability} />
      </div>
    </Link>
  );
}
