import { useTranslations } from "next-intl";
import { availabilityLabel, type Availability } from "@/modules/catalog";

const STYLES: Record<ReturnType<typeof availabilityLabel>["key"], string> = {
  inStock: "bg-green-50 text-green-700",
  soldOut: "bg-neutral-100 text-neutral-500",
  madeToOrder: "bg-amber-50 text-amber-700",
  oneOfAKind: "bg-purple-50 text-purple-700",
  oneOfAKindSold: "bg-neutral-100 text-neutral-500",
};

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  const t = useTranslations("catalog.availability");
  const { key, days } = availabilityLabel(availability);
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[key]}`}>
      {t(key, { days })}
    </span>
  );
}
