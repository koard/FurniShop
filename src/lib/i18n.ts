import { notFound } from "next/navigation";
import type { Locale } from "../../types/enums";

export const DEFAULT_LOCALE: Locale = "th";
export const SUPPORTED_LOCALES: Locale[] = ["th", "en"];

export async function getMessages(locale: Locale) {
  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    return messages as Record<string, string | Record<string, string>>;
  } catch (error) {
    console.error(`Unable to load messages for locale ${locale}`, error);
    return {};
  }
}

export function isSupportedLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

export function assertLocale(locale: string | undefined): Locale {
  if (!locale) return DEFAULT_LOCALE;
  if (!isSupportedLocale(locale)) {
    notFound();
  }
  return locale;
}
