import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "../../types/enums";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  options: Intl.NumberFormatOptions & { locale?: string; currency?: string } = {}
) {
  const { locale = "th-TH", currency = "THB", ...formatOptions } = options;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    ...formatOptions,
  }).format(amount);
}

export function formatDate(value: string | Date, locale: Locale = "th") {
  const date = typeof value === "string" ? new Date(value) : value;
  const intlLocale = locale === "th" ? "th-TH" : "en-US";

  return new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function calculateDiscountedPrice(
  price: number,
  discountPct?: number,
  discountAmount?: number
) {
  if (discountPct) {
    return Math.max(price - price * (discountPct / 100), 0);
  }
  if (discountAmount) {
    return Math.max(price - discountAmount, 0);
  }
  return price;
}

export function percentage(part: number, total: number) {
  if (total === 0) return 0;
  return (part / total) * 100;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function isBrowser() {
  return typeof window !== "undefined";
}

export function ensureArray<T>(value: T | T[] | undefined | null) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}
