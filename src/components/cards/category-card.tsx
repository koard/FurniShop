import Link from "next/link";
import type { Route } from "next";

import { cn } from "@/lib/utils";

type CategoryCardProps = {
  title: string;
  image: string;
  href?: Route<string>;
  className?: string;
};

export function CategoryCard({ title, image, href = "/catalog" as Route<string>, className }: CategoryCardProps) {
  const content = (
    <article
      className={cn(
        "group relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-lg ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        className
      )}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${image})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" aria-hidden />
      <div className="relative flex h-full flex-col justify-between px-5 pb-5 pt-6 text-white">
        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/70">หมวดหมู่</span>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        </div>
        <div className="flex items-center justify-between text-sm text-white/85">
          <span>สำรวจสินค้า</span>
          <span
            aria-hidden
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg font-medium transition group-hover:bg-white/25"
          >
            →
          </span>
        </div>
        <span className="sr-only">ดูหมวดหมู่ {title}</span>
      </div>
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
