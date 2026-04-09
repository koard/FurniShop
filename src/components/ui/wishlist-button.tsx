"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-store";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  item: {
    id: string;
    slug: string;
    name: string;
    image: string;
    price: number;
    originalPrice: number;
    category: string;
  };
  className?: string;
  size?: "sm" | "md";
}

export function WishlistButton({ item, className, size = "md" }: WishlistButtonProps) {
  const { has, toggle } = useWishlist();
  const isWishlisted = has(item.id);

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-label={isWishlisted ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
      className={cn(
        "flex items-center justify-center rounded-full border transition-all",
        size === "md"
          ? "h-10 w-10 border-border hover:border-rose-400 hover:bg-rose-50"
          : "h-8 w-8 border-border/60 hover:border-rose-400 hover:bg-rose-50",
        isWishlisted
          ? "border-rose-400 bg-rose-50 text-rose-500"
          : "bg-background text-muted-foreground",
        className
      )}
    >
      <Heart
        className={cn(
          "transition-all",
          size === "md" ? "h-5 w-5" : "h-4 w-4",
          isWishlisted ? "fill-rose-500 text-rose-500" : ""
        )}
      />
    </button>
  );
}
