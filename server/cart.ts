'use server';

import { revalidatePath } from 'next/cache';
import { db, getCartByUser, upsertCart } from './db';

export async function getCart(userId: string) {
  return getCartByUser(userId);
}

export async function addToCart(userId: string, productId: string, qty = 1) {
  const cart = await getCartByUser(userId);
  const product = db.products.find((item) => item.id === productId);
  if (!product) throw new Error('Product not found');

  const existing = cart.items.find((item) => item.productId === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.items.push({ productId, qty });
  }

  await upsertCart(userId, cart.items);
  await revalidatePath('/cart');
  return getCartByUser(userId);
}

export async function updateQty(userId: string, productId: string, qty: number) {
  if (qty <= 0) {
    return removeFromCart(userId, productId);
  }
  const cart = await getCartByUser(userId);
  const existing = cart.items.find((item) => item.productId === productId);
  if (!existing) throw new Error('Item not found in cart');

  existing.qty = qty;
  await upsertCart(userId, cart.items);
  await revalidatePath('/cart');
  return getCartByUser(userId);
}

export async function removeFromCart(userId: string, productId: string) {
  const cart = await getCartByUser(userId);
  cart.items = cart.items.filter((item) => item.productId !== productId);
  await upsertCart(userId, cart.items);
  await revalidatePath('/cart');
  return getCartByUser(userId);
}

export async function clearCartForUser(userId: string) {
  db.carts.delete(userId);
  await revalidatePath('/cart');
}
