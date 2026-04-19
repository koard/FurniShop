'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from './db';

type CartItem = {
  productId: string;
  qty: number;
};

const CART_COOKIE_NAME = 'furnishop_cart';

export async function getCart(userId?: string) {
  const store = await cookies();
  const cartCookie = store.get(CART_COOKIE_NAME)?.value;
  let items: CartItem[] = [];
  if (cartCookie) {
    try {
      items = JSON.parse(cartCookie);
    } catch {
      // ignore
    }
  }
  return { userId: userId ?? 'guest', items, updatedAt: new Date().toISOString() };
}

export async function addToCart(userId: string, productId: string, qty = 1) {
  const cart = await getCart(userId);
  const product = db.products.find((item) => item.id === productId);
  if (!product) throw new Error('Product not found');

  const existing = cart.items.find((item) => item.productId === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.items.push({ productId, qty });
  }

  const store = await cookies();
  store.set(CART_COOKIE_NAME, JSON.stringify(cart.items), { maxAge: 60 * 60 * 24 * 30 });
  await revalidatePath('/cart');
  return cart;
}

export async function updateQty(userId: string, productId: string, qty: number) {
  if (qty <= 0) {
    return removeFromCart(userId, productId);
  }
  const cart = await getCart(userId);
  const existing = cart.items.find((item) => item.productId === productId);
  if (!existing) throw new Error('Item not found in cart');

  existing.qty = qty;
  const store = await cookies();
  store.set(CART_COOKIE_NAME, JSON.stringify(cart.items), { maxAge: 60 * 60 * 24 * 30 });
  await revalidatePath('/cart');
  return cart;
}

export async function removeFromCart(userId: string, productId: string) {
  const cart = await getCart(userId);
  cart.items = cart.items.filter((item) => item.productId !== productId);
  const store = await cookies();
  store.set(CART_COOKIE_NAME, JSON.stringify(cart.items), { maxAge: 60 * 60 * 24 * 30 });
  await revalidatePath('/cart');
  return cart;
}

export async function clearCartForUser(userId: string) {
  const store = await cookies();
  store.delete(CART_COOKIE_NAME);
  await revalidatePath('/cart');
}
