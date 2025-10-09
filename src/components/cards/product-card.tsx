import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Star } from "lucide-react";

import type { Product } from "../../../types/product";
import { calculateDiscountedPrice, cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type ProductCardProps = {
  product: Product;
  href?: Route<string>;
  className?: string;
};

export function ProductCard({ product, href = `/product/${product.slug}` as Route<string>, className }: ProductCardProps) {
  const discounted = calculateDiscountedPrice(product.price, product.discountPercentage, product.discountAmount);
  const hasDiscount = discounted < product.price;

  const content = (
    <article className={cn("group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md", className)}>
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          priority={false}
        />
        {hasDiscount ? (
          <Badge variant="secondary" className="absolute left-3 top-3">
            ลด {Math.round(((product.price - discounted) / product.price) * 100)}%
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-primary/80 text-primary" />
            {product.rating.toFixed(1)}
          </span>
          <span>({product.reviewCount})</span>
        </div>
        <h3 className="text-base font-semibold text-foreground">{product.name}</h3>
  <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-semibold text-foreground">{formatCurrency(discounted)}</span>
          {hasDiscount ? (
            <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.price)}</span>
          ) : null}
        </div>
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
