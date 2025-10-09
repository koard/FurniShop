'use server';

import { db } from './db';
import { calculateDiscountedPrice } from '../src/lib/utils';

export async function listPromotions() {
  return db.promotions;
}

export async function applyCode(code: string, subtotal: number) {
  const promotion = db.promotions.find(
    (promo) => promo.code.toUpperCase() === code.toUpperCase() && promo.active
  );

  if (!promotion) {
    return {
      success: false,
      total: subtotal,
      discount: 0,
      message: 'Invalid or inactive promotion code',
    } as const;
  }

  const discounted = calculateDiscountedPrice(
    subtotal,
    promotion.discountPct,
    promotion.discountAmt
  );

  return {
    success: true,
    total: discounted,
    discount: subtotal - discounted,
    promotion,
  } as const;
}
