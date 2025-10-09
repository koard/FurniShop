import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { Star, Truck, ShieldCheck, Sparkles } from "lucide-react";

import { getProduct, listProducts } from "@server/products";
import { db } from "@server/db";
import { addToCart } from "@server/cart";
import { getSession } from "@server/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductCard } from "@/components/cards/product-card";
import { calculateDiscountedPrice, cn, formatCurrency, formatDate, percentage } from "@/lib/utils";

type ProductPageParams = {
  slug: string;
};

type ProductPageProps = {
  params: Promise<ProductPageParams>;
};

type ReviewWithAuthor = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  authorName: string;
  authorInitials: string;
  authorAvatar?: string;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return {
      title: "ไม่พบสินค้า | FurniShop",
    };
  }

  return {
    title: `${product.name} | FurniShop`,
    description: product.description,
    openGraph: {
      title: `${product.name} | FurniShop`,
      description: product.description ?? `ค้นหาผลิตภัณฑ์จาก FurniShop ในหมวด ${product.category}`,
      images: product.images.map((src) => ({ url: src })),
    },
  } satisfies Metadata;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    notFound();
  }

  const discountedPrice = calculateDiscountedPrice(product.price, product.discountPercentage, product.discountAmount);
  const hasDiscount = discountedPrice < product.price;
  const rating = product.rating;
  const reviews: ReviewWithAuthor[] = db.reviews
    .filter((review) => review.productId === product.id)
    .map((review) => {
      const user = db.users.find((candidate) => candidate.id === review.userId);
      const authorName = user?.name ?? "Guest";
      const initials = authorName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        authorName,
        authorInitials: initials,
        authorAvatar: user?.avatar,
      };
    });

  const ratingBuckets = [5, 4, 3, 2, 1].map((bucket) => ({
    score: bucket,
    count: reviews.filter((review) => review.rating === bucket).length,
  }));
  const totalReviews = reviews.length;
  const relatedCandidate = await listProducts({ category: product.category, limit: 4 });
  const related = relatedCandidate.items.filter((item) => item.id !== product.id).slice(0, 3);
  const productId = product.id;

  // Server action for Add to Cart
  async function addToCartAction() {
    "use server";
    const session = await getSession();
    // Fallback to any CUSTOMER user if not signed-in (same strategy as loadCartLines)
    const fallbackCustomer = db.users.find((user) => user.role === "CUSTOMER");
    const activeUserId = session?.user?.id ?? fallbackCustomer?.id;
    if (!activeUserId) {
      // If truly no user to attach, go to sign-in
      redirect("/auth/sign-in" as Route<string>);
    }
  await addToCart(activeUserId, productId, 1);
    redirect("/cart" as Route<string>);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 lg:px-8 xl:px-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href={"/" as Route<string>} className="hover:text-foreground">
              หน้าแรก
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={"/catalog" as Route<string>} className="hover:text-foreground">
              สินค้าทั้งหมด
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href={`/catalog?category=${encodeURIComponent(product.category)}` as Route<string>}
              className="hover:text-foreground"
            >
              {product.category}
            </Link>
          </li>
          <li>/</li>
          <li className="font-medium text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
            <Image
              fill
              src={product.images[0]}
              alt={product.name}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {hasDiscount ? (
              <Badge className="absolute left-4 top-4 bg-primary text-primary-foreground">ลดราคาพิเศษ</Badge>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-semibold text-foreground md:text-4xl">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 text-primary">
                <Star className="h-4 w-4 fill-primary" />
                {rating.toFixed(1)}
              </span>
              <span>({product.reviewCount} รีวิว)</span>
              <span className="hidden md:inline" aria-hidden>
                •
              </span>
              <span>พร้อมส่ง {product.stock} ชิ้น</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-foreground md:text-4xl">
              {formatCurrency(discountedPrice)}
            </span>
            {hasDiscount ? (
              <span className="text-lg text-muted-foreground line-through">{formatCurrency(product.price)}</span>
            ) : null}
            {product.discountPercentage ? (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                ประหยัด {product.discountPercentage}%
              </Badge>
            ) : null}
          </div>

          {product.description ? (
            <p className="text-base leading-relaxed text-muted-foreground">{product.description}</p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form action={addToCartAction} className="flex-1 sm:flex-none">
              <Button type="submit" size="lg" className="w-full sm:w-auto sm:px-10">
                เพิ่มลงตะกร้า
              </Button>
            </form>
            <Button variant="outline" size="lg" className="flex-1 sm:flex-none sm:px-8">
              เพิ่มในรายการโปรด
            </Button>
          </div>

          <div className="grid gap-4 rounded-2xl border border-border bg-muted/40 p-6 sm:grid-cols-3">
            <div>
              <span className="text-xs text-muted-foreground">ขนาด</span>
              <p className="mt-1 font-medium text-foreground">{product.size}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">วัสดุ</span>
              <p className="mt-1 font-medium text-foreground">{product.material}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">คงเหลือ</span>
              <p className="mt-1 font-medium text-foreground">{product.stock} ชิ้น</p>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-border/60 p-6 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">จัดส่งทั่วประเทศ</h3>
                <p className="text-xs text-muted-foreground">ฟรีค่าจัดส่งเมื่อสั่งซื้อครบ 5,000 บาท</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">รับประกัน 2 ปี</h3>
                <p className="text-xs text-muted-foreground">ดูแลเฟอร์นิเจอร์ตลอดระยะเวลารับประกัน</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">บริการติดตั้ง</h3>
                <p className="text-xs text-muted-foreground">ทีมงานมืออาชีพพร้อมติดตั้งถึงบ้าน</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-16 border-t border-border pt-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">รีวิวจากลูกค้า</h2>
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-muted/40 p-6">
              <div>
                <p className="text-4xl font-semibold text-foreground">{rating.toFixed(1)}</p>
                <div className="mt-1 flex items-center gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={cn(
                        "h-5 w-5",
                        index + 1 <= Math.round(rating) ? "fill-primary" : "fill-muted text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">จาก {totalReviews || product.reviewCount} รีวิวทั้งหมด</p>
              </div>
              <div className="flex-1 space-y-2">
                {ratingBuckets.map(({ score, count }) => (
                  <div key={score} className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="w-12 font-medium text-foreground">{score} ดาว</span>
                    <div className="relative h-2 flex-1 rounded-full bg-muted">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-primary"
                        style={{ width: `${percentage(count, totalReviews || product.reviewCount)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/80 p-8 text-center">
                  <p className="text-sm text-muted-foreground">ยังไม่มีรีวิวจากลูกค้า ลงทะเบียนเพื่อเป็นคนแรกที่รีวิวสินค้า</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <article key={review.id} className="flex gap-4 rounded-xl border border-border/70 p-6">
                    <Avatar>
                      {review.authorAvatar ? (
                        <AvatarImage src={review.authorAvatar} alt={review.authorName} />
                      ) : (
                        <AvatarFallback>{review.authorInitials}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-foreground">{review.authorName}</h3>
                        <div className="flex items-center gap-1 text-primary">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={cn(
                                "h-4 w-4",
                                index + 1 <= review.rating ? "fill-primary" : "fill-muted text-muted-foreground"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">สินค้าใกล้เคียง</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={"/catalog" as Route<string>}>ดูทั้งหมด</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
