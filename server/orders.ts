'use server';

import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { db, clearCart, getCartByUser } from './db';
import type { Order, OrderStatus } from '../types/order';
import { calculateDiscountedPrice, formatCurrency } from '../src/lib/utils';

interface CreateOrderInput {
  userId: string;
  paymentRef?: string;
  promotionCode?: string;
  note?: string;
}

export async function listOrdersByUser(userId: string, status?: OrderStatus) {
  const orders = db.orders.filter((order) => order.userId === userId);
  return status ? orders.filter((order) => order.status === status) : orders;
}

export async function getOrder(orderId: string) {
  return db.orders.find((order) => order.id === orderId) ?? null;
}

export async function createOrder(input: CreateOrderInput) {
  const { userId, paymentRef, promotionCode, note } = input;
  const cart = await getCartByUser(userId);

  if (!cart.items.length) {
    throw new Error('Cart is empty');
  }

  const items = cart.items.map((item) => {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) throw new Error('Product not found');
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: item.qty,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  let total = subtotal;
  let appliedPromotion: string | undefined;

  if (promotionCode) {
    const promotion = db.promotions.find(
      (promo) => promo.code.toUpperCase() === promotionCode.toUpperCase() && promo.active
    );
    if (promotion) {
      total = calculateDiscountedPrice(subtotal, promotion.discountPct, promotion.discountAmt);
      appliedPromotion = promotion.code;
    }
  }

  const newOrder: Order = {
    id: nanoid(),
    userId,
    items,
    total,
    paymentRef,
    status: 'PENDING',
    trackingCode: `FS-${Date.now().toString().slice(-6)}`,
    timeline: [
      { status: 'PENDING', at: new Date().toISOString(), note: note ?? undefined },
    ],
  };

  db.orders.push(newOrder);
  await clearCart(userId);

  await revalidatePath('/orders');
  await revalidatePath('/(customer)/account');

  return {
    order: newOrder,
    subtotal,
    total,
    promotion: appliedPromotion,
    currency: formatCurrency(total),
  };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  const order = db.orders.find((entry) => entry.id === orderId);
  if (!order) throw new Error('Order not found');

  order.status = status;
  order.timeline.push({ status, at: new Date().toISOString(), note });

  await revalidatePath(`/orders/${orderId}`);
  await revalidatePath('/(admin)/admin/orders');

  return order;
}
