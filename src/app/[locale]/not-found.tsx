import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="text-neutral-600">{t("description")}</p>
      <Link href="/" className="text-sm font-medium underline underline-offset-4">
        {t("back")}
      </Link>
    </main>
  );
}
