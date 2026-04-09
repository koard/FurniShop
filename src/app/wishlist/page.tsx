"use client";

import Link from "next/link";
import type { Route } from "next";
import { Trash2, ShoppingCart, HeartCrack } from "lucide-react";
import Image from "next/image";

import { useWishlist } from "@/lib/wishlist-store";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function WishlistPage() {
  const { items, remove, clear } = useWishlist();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">รายการโปรด</h1>
          <p className="text-sm text-muted-foreground">
            สินค้าที่คุณบันทึกไว้สำหรับช้อปในอนาคต ({items.length} รายการ)
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" onClick={clear}>
            ลบทั้งหมด
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/80 bg-muted/30 px-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <HeartCrack className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">รายการโปรดของคุณยังว่างเปล่า</h2>
            <p className="text-muted-foreground">ลองค้นหาสินค้าที่ถูกใจแล้วกดรูปหัวใจเพื่อบันทึกไว้ดูทีหลังสิ</p>
          </div>
          <Button asChild className="mt-4" size="lg">
            <Link href={"/catalog" as Route<string>}>เลือกชมสินค้าเลย</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-background transition-shadow hover:shadow-md"
            >
              <button
                onClick={() => remove(item.id)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm backdrop-blur transition hover:bg-rose-50 hover:text-rose-500"
                aria-label="ลบออกจากรายการโปรด"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <Link href={`/product/${item.slug}` as Route<string>} className="flex flex-col">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {item.price < item.originalPrice && (
                    <div className="absolute left-3 top-3 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
                      SALE
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <span className="mb-1 text-xs font-medium text-primary">{item.category}</span>
                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:underline">
                    {item.name}
                  </h3>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-lg font-semibold text-foreground">
                      {formatCurrency(item.price)}
                    </span>
                    {item.price < item.originalPrice && (
                      <span className="mb-0.5 text-xs text-muted-foreground line-through">
                        {formatCurrency(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
