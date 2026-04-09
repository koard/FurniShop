import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

import { listProducts } from "@server/products";
import { db } from "@server/db";
import { ProductCard } from "@/components/cards/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CatalogForm } from "@/components/filters/catalog-form";
import { PriceRangeSlider } from "@/components/filters/price-range-slider";
import { cn, formatCurrency } from "@/lib/utils";
import type { ProductFilter } from "../../../types/product";

type CatalogSearchParams = Record<string, string | string[] | undefined>;

type CatalogPageProps = {
  searchParams?: Promise<CatalogSearchParams>;
};

type FilterState = {
  q?: string;
  categories: string[];
  materials: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: ProductFilter["sort"];
  page: number;
};

const PAGE_SIZE = 12;
const SORT_OPTIONS: Array<{ label: string; value: NonNullable<ProductFilter["sort"]> }> = [
  { label: "ใหม่ล่าสุด", value: "newest" },
  { label: "ราคาต่ำไปสูง", value: "price-asc" },
  { label: "ราคาสูงไปต่ำ", value: "price-desc" },
  { label: "เรตติ้งสูง", value: "top-rated" },
];
const RATING_OPTIONS = [4, 3, 2, 1];
const PRICE_RANGE = {
  min: 0,
  max: 60000,
  step: 500,
};

function toArrayValue(value: string | string[] | undefined) {
  if (!value) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null) return undefined;
  return raw;
}

function toNumber(value: string | string[] | undefined) {
  const raw = toArrayValue(value);
  if (!raw || raw.trim() === "") return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toArrayValues(value: string | string[] | undefined) {
  if (!value) return [];
  const array = Array.isArray(value) ? value : [value];
  const unique = new Set<string>();
  for (const entry of array) {
    const trimmed = entry?.trim();
    if (trimmed) unique.add(trimmed);
  }
  return Array.from(unique);
}

function clampNumber(value: number | undefined, min: number, max: number) {
  if (value == null) return undefined;
  return Math.min(Math.max(value, min), max);
}

function parseFilter(searchParams: CatalogSearchParams): FilterState {
  const q = toArrayValue(searchParams.q);
  const categories = toArrayValues(searchParams.category);
  const materials = toArrayValues(searchParams.material);
  const sortCandidate = toArrayValue(searchParams.sort);
  let minPrice = clampNumber(toNumber(searchParams.minPrice), PRICE_RANGE.min, PRICE_RANGE.max);
  let maxPrice = clampNumber(toNumber(searchParams.maxPrice), PRICE_RANGE.min, PRICE_RANGE.max);
  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }
  const rating = toNumber(searchParams.rating);
  const page = Math.max(1, toNumber(searchParams.page) ?? 1);

  const allowedSort = SORT_OPTIONS.map((option) => option.value);
  const sort =
    sortCandidate && allowedSort.includes(sortCandidate as (typeof allowedSort)[number])
      ? (sortCandidate as (typeof allowedSort)[number])
      : undefined;

  return {
    q: q?.trim() ? q.trim() : undefined,
    categories,
    materials,
    minPrice,
    maxPrice,
    rating,
    sort,
    page,
  };
}

type HiddenFiltersProps = {
  filter: FilterState;
  exclude?: Array<keyof FilterState>;
};

function HiddenFilters({ filter, exclude = [] }: HiddenFiltersProps) {
  const entries: Array<[string, string]> = [];

  if (filter.q && !exclude.includes("q")) entries.push(["q", filter.q]);
  if (filter.categories.length && !exclude.includes("categories")) {
    filter.categories.forEach((category) => entries.push(["category", category]));
  }
  if (filter.materials.length && !exclude.includes("materials")) {
    filter.materials.forEach((material) => entries.push(["material", material]));
  }
  if (filter.minPrice != null && !exclude.includes("minPrice")) entries.push(["minPrice", String(filter.minPrice)]);
  if (filter.maxPrice != null && !exclude.includes("maxPrice")) entries.push(["maxPrice", String(filter.maxPrice)]);
  if (filter.rating != null && !exclude.includes("rating")) entries.push(["rating", String(filter.rating)]);
  if (filter.sort && !exclude.includes("sort")) entries.push(["sort", filter.sort]);
  if (filter.page && !exclude.includes("page")) entries.push(["page", String(filter.page)]);

  return (
    <>
      {entries.map(([key, value], index) => (
        <input key={`${key}-${value}-${index}`} type="hidden" name={key} value={value} />
      ))}
    </>
  );
}

type FilterCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

function FilterCard({ title, description, action, children }: FilterCardProps) {
  return (
    <section className="rounded-xl border border-border/35 bg-background/95 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground/90">{title}</h3>
          {description ? <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground/80">{description}</p> : null}
        </div>
        {action ? <div className="text-[11px] text-muted-foreground/70">{action}</div> : null}
      </div>
      <div className="mt-3 space-y-2.5">{children}</div>
    </section>
  );
}

function buildRoute(filter: FilterState, overrides: Partial<FilterState>): Route<string> {
  const query = new URLSearchParams();
  const state: FilterState = { ...filter, ...overrides };

  if (state.q) query.set("q", state.q);
  if (state.categories.length) state.categories.forEach((category) => query.append("category", category));
  if (state.materials.length) state.materials.forEach((material) => query.append("material", material));
  if (state.minPrice != null) query.set("minPrice", String(state.minPrice));
  if (state.maxPrice != null) query.set("maxPrice", String(state.maxPrice));
  if (state.rating != null) query.set("rating", String(state.rating));
  if (state.sort) query.set("sort", state.sort);
  if (state.page > 1) query.set("page", String(state.page));

  const qs = query.toString();
  return (`/catalog${qs ? `?${qs}` : ""}`) as Route<string>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const resolvedSearchParams: CatalogSearchParams = (await searchParams) ?? {};
  const filter = parseFilter(resolvedSearchParams);
  const { items, total, totalPages, page } = await listProducts({
    q: filter.q,
    categories: filter.categories,
    materials: filter.materials,
    minPrice: filter.minPrice,
    maxPrice: filter.maxPrice,
    rating: filter.rating,
    sort: filter.sort,
    page: filter.page,
    limit: PAGE_SIZE,
  });

  const categories = db.categories;
  const materials = Array.from(new Set(db.products.map((product) => product.material))).sort();
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 pb-16 pt-8 lg:px-8 xl:px-12">
      <aside className="hidden w-80 shrink-0 lg:block">
        <div className="space-y-6">
          <div>
            <CatalogForm className="mt-6 space-y-6">
              <HiddenFilters filter={filter} exclude={["categories", "materials", "minPrice", "maxPrice", "rating", "page"]} />

              <FilterCard
                title="หมวดหมู่"
                action=
                  {filter.categories.length ? (
                    <Link
                      href={buildRoute(filter, { categories: [], page: 1 })}
                      className="text-[11px] font-medium text-primary/80 transition hover:text-primary"
                    >
                      ล้าง
                    </Link>
                  ) : null}
              >
                <div className="grid gap-1.5">
                  {categories.map((category) => (
                    <label key={category} className="group relative block">
                      <input
                        type="checkbox"
                        name="category"
                        value={category}
                        defaultChecked={filter.categories.includes(category)}
                        className="peer sr-only"
                      />
                      <span className="flex items-center rounded-lg border border-border/50 bg-background px-3.5 py-2 text-xs font-medium text-muted-foreground/90 transition hover:border-primary/40 hover:bg-primary/5 peer-checked:border-primary/60 peer-checked:bg-primary/10 peer-checked:text-primary">
                        <span>{category}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </FilterCard>

              <FilterCard
                title="วัสดุ"
                action=
                  {filter.materials.length ? (
                    <Link
                      href={buildRoute(filter, { materials: [], page: 1 })}
                      className="text-[11px] font-medium text-primary/80 transition hover:text-primary"
                    >
                      ล้าง
                    </Link>
                  ) : null}
              >
                <div className="grid gap-1.5">
                  {materials.map((material) => (
                    <label key={material} className="group relative block">
                      <input
                        type="checkbox"
                        name="material"
                        value={material}
                        defaultChecked={filter.materials.includes(material)}
                        className="peer sr-only"
                      />
                      <span className="flex items-center rounded-lg border border-border/50 bg-background px-3.5 py-2 text-xs font-medium text-muted-foreground/90 transition hover:border-primary/40 hover:bg-primary/5 peer-checked:border-primary/60 peer-checked:bg-primary/10 peer-checked:text-primary">
                        <span>{material}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </FilterCard>

              <FilterCard title="ช่วงราคา">
                <PriceRangeSlider
                  min={PRICE_RANGE.min}
                  max={PRICE_RANGE.max}
                  step={PRICE_RANGE.step}
                  defaultValue={[filter.minPrice ?? PRICE_RANGE.min, filter.maxPrice ?? PRICE_RANGE.max]}
                  nameMin="minPrice"
                  nameMax="maxPrice"
                />
              </FilterCard>

              <FilterCard title="เรตติ้ง">
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer">
                    <input type="radio" name="rating" value="" defaultChecked={filter.rating == null} className="peer sr-only" />
                    <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-border/40 bg-background/95 px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground/90 transition hover:border-primary/40 hover:bg-primary/5 peer-checked:border-primary/60 peer-checked:bg-primary/10 peer-checked:text-primary">
                      ทุกเรตติ้ง
                    </span>
                  </label>
                  {RATING_OPTIONS.map((rating) => (
                    <label key={rating} className="cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        defaultChecked={filter.rating === rating}
                        className="peer sr-only"
                      />
                      <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-border/40 bg-background/95 px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground/90 transition hover:border-primary/40 hover:bg-primary/5 peer-checked:border-primary/60 peer-checked:bg-primary/10 peer-checked:text-primary">
                        {rating} ดาวขึ้นไป
                      </span>
                    </label>
                  ))}
                </div>
              </FilterCard>

            </CatalogForm>
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col gap-6">
        <div className="space-y-4">

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              แสดง {start}-{end} จากทั้งหมด {total} รายการ
            </div>
            <form className="flex items-center gap-2 text-sm" action="/catalog" method="get">
              <HiddenFilters filter={filter} exclude={["sort", "page"]} />
              <label htmlFor="sort" className="text-muted-foreground">
                เรียงตาม
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={filter.sort ?? "newest"}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm shadow-sm focus:border-primary focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="secondary" size="sm">
                ตกลง
              </Button>
            </form>
          </div>
          {filter.q || filter.categories.length || filter.materials.length || filter.rating != null || filter.minPrice != null || filter.maxPrice != null ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">ตัวกรองที่เลือก:</span>
              {filter.q ? <Badge variant="secondary">ค้นหา: {filter.q}</Badge> : null}
              {filter.categories.map((category) => (
                <Badge key={`category-${category}`} variant="secondary">
                  หมวดหมู่: {category}
                </Badge>
              ))}
              {filter.materials.map((material) => (
                <Badge key={`material-${material}`} variant="secondary">
                  วัสดุ: {material}
                </Badge>
              ))}
              {filter.rating != null ? <Badge variant="secondary">เรตติ้ง {filter.rating}+ ดาว</Badge> : null}
              {filter.minPrice != null || filter.maxPrice != null ? (
                <Badge variant="secondary" className="gap-1">
                  {filter.minPrice != null ? `≥ ${formatCurrency(filter.minPrice)}` : null}
                  {filter.minPrice != null && filter.maxPrice != null ? "-" : null}
                  {filter.maxPrice != null ? `≤ ${formatCurrency(filter.maxPrice)}` : null}
                </Badge>
              ) : null}
              <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                <Link href={"/catalog" as Route<string>}>ล้างทั้งหมด</Link>
              </Button>
            </div>
          ) : null}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-border/80 bg-muted/40 p-10 text-center">
              <h3 className="text-lg font-semibold text-foreground">ไม่พบสินค้าที่ตรงกับการค้นหา</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                ลองปรับตัวกรองหรือค้นหาด้วยคำอื่นเพื่อดูตัวเลือกเพิ่มเติม
              </p>
            </div>
          ) : (
            items.map((product) => <ProductCard key={product.id} product={product} className="h-full" />)
          )}
        </div>
        {totalPages > 1 ? (
          <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
            <span
              className={cn(
                "flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium",
                page <= 1
                  ? "cursor-not-allowed border-border bg-muted/60 text-muted-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/60 hover:text-primary"
              )}
            >
              {page <= 1 ? (
                <span>ก่อนหน้า</span>
              ) : (
                <Link href={buildRoute(filter, { page: Math.max(1, page - 1) })}>ก่อนหน้า</Link>
              )}
            </span>
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              const isActive = pageNumber === page;
              return (
                <Link
                  key={pageNumber}
                  href={buildRoute(filter, { page: pageNumber })}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground"
                  )}
                >
                  {pageNumber}
                </Link>
              );
            })}
            <span
              className={cn(
                "flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium",
                page >= totalPages
                  ? "cursor-not-allowed border-border bg-muted/60 text-muted-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/60 hover:text-primary"
              )}
            >
              {page >= totalPages ? (
                <span>ถัดไป</span>
              ) : (
                <Link href={buildRoute(filter, { page: Math.min(totalPages, page + 1) })}>ถัดไป</Link>
              )}
            </span>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
