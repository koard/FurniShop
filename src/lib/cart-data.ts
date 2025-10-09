'use server';

import { getSession } from "@server/auth";
import { getCart } from "@server/cart";
import { db } from "@server/db";
import { calculateDiscountedPrice } from "./utils";

export type CartLine = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image: string;
  qty: number;
  price: number;
  originalPrice: number;
};

export async function loadCartLines() {
  const session = await getSession();
  const fallbackCustomer = db.users.find((user) => user.role === "CUSTOMER");
  const activeUserId = session?.user?.id ?? fallbackCustomer?.id;
  if (!activeUserId) {
    return { lines: [] as CartLine[], subtotal: 0 } as const;
  }

  const cart = await getCart(activeUserId);
  const lines = cart.items
    .map((item) => {
      const product = db.products.find((candidate) => candidate.id === item.productId);
      if (!product) return null;
      const effectivePrice = calculateDiscountedPrice(
        product.price,
        product.discountPercentage,
        product.discountAmount
      );
      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        image: product.images[0],
        qty: item.qty,
        price: effectivePrice,
        originalPrice: product.price,
      } satisfies CartLine;
    })
    .filter(Boolean) as CartLine[];

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  return { lines, subtotal } as const;
}
