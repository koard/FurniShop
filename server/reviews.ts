'use server';

import { nanoid } from 'nanoid';
import { db, Review } from './db';

interface CreateReviewInput {
  userId: string;
  productId: string;
  rating: number;
  comment: string;
}

function hasPurchasedProduct(userId: string, productId: string) {
  return db.orders.some((order) =>
    order.userId === userId && order.items.some((item) => item.productId === productId)
  );
}

export async function createReview(input: CreateReviewInput) {
  const { userId, productId, rating, comment } = input;
  if (!hasPurchasedProduct(userId, productId)) {
    throw new Error('You can review products you have purchased only.');
  }

  const product = db.products.find((item) => item.id === productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const review: Review = {
    id: nanoid(),
    userId,
    productId,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };

  db.reviews.push(review);

  const productReviews = db.reviews.filter((entry) => entry.productId === productId);
  const totalRating = productReviews.reduce((sum, entry) => sum + entry.rating, 0);
  product.rating = Math.round((totalRating / productReviews.length) * 10) / 10;
  product.reviewCount = productReviews.length;

  return review;
}
