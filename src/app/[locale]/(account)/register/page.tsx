"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = { status: "idle" };

export default function RegisterPage() {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  const errorMessage =
    state.status === "error"
      ? state.error === "EMAIL_TAKEN"
        ? t("emailTaken")
        : state.error === "GENERIC"
          ? t("genericError")
          : t("invalidData")
      : null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold">{t("registerTitle")}</h1>

      {state.status === "success" ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-green-700">{t("registerSuccess")}</p>
          <Link
            href="/login"
            className="rounded-full bg-neutral-900 px-6 py-3 text-center text-sm font-medium text-white"
          >
            {t("loginCta")}
          </Link>
        </div>
      ) : (
        <>
          <form action={formAction} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              {t("name")}
              <input
                name="name"
                required
                autoComplete="name"
                className="rounded border border-neutral-300 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {t("email")}
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="rounded border border-neutral-300 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {t("password")}
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="rounded border border-neutral-300 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {t("confirmPassword")}
              <input
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                className="rounded border border-neutral-300 px-3 py-2"
              />
            </label>

            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? t("submitting") : t("registerCta")}
            </button>
          </form>

          <Link href="/login" className="text-sm underline underline-offset-4">
            {t("toLogin")}
          </Link>
        </>
      )}
    </main>
  );
}
