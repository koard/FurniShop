'use server';

import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { db } from './db';
import type { Product, ProductFilter } from '../types/product';
import { slugify } from '../src/lib/utils';

export type PaginatedProducts = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const DEFAULT_PAGE_SIZE = 12;

function applyFilter(products: Product[], filter: ProductFilter = {}) {
  let results = [...products];

  if (filter.q) {
    const q = filter.q.toLowerCase();
    results = results.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.material.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q)
    );
  }

  const categoryFilters = [
    ...(filter.categories ?? []),
    ...(filter.category ? [filter.category] : []),
  ]
    .map((value) => value.toLowerCase())
    .filter((value, index, array) => array.indexOf(value) === index);

  if (categoryFilters.length) {
    results = results.filter((product) => categoryFilters.includes(product.category.toLowerCase()));
  }

  const materialFilters = [
    ...(filter.materials ?? []),
    ...(filter.material ? [filter.material] : []),
  ]
    .map((value) => value.toLowerCase())
    .filter((value, index, array) => array.indexOf(value) === index);

  if (materialFilters.length) {
    results = results.filter((product) => materialFilters.includes(product.material.toLowerCase()));
  }

  if (filter.minPrice != null) {
    results = results.filter((product) => product.price >= (filter.minPrice ?? 0));
  }

  if (filter.maxPrice != null) {
    results = results.filter((product) => product.price <= (filter.maxPrice ?? Number.MAX_SAFE_INTEGER));
  }

  if (filter.rating != null) {
    results = results.filter((product) => product.rating >= (filter.rating ?? 0));
  }

  if (filter.sort) {
    switch (filter.sort) {
      case 'price-asc':
        results = results.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results = results.sort((a, b) => b.price - a.price);
        break;
      case 'top-rated':
        results = results.sort((a, b) => b.rating - a.rating);
        break;
      default:
        results = results.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }

  return results;
}

export async function listProducts(filter: ProductFilter = {}): Promise<PaginatedProducts> {
  const page = filter.page ?? 1;
  const pageSize = filter.limit ?? DEFAULT_PAGE_SIZE;
  const filtered = applyFilter(db.products, filter);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const offset = (page - 1) * pageSize;
  const items = filtered.slice(offset, offset + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getProduct(slug: string) {
  return db.products.find((product) => product.slug === slug) ?? null;
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'slug'> & { slug?: string }) {
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);

  if (db.products.some((product) => product.slug === slug)) {
    throw new Error('Product with this slug already exists');
  }

  const newProduct: Product = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    ...data,
    slug,
  };

  db.products.push(newProduct);
  revalidatePath('/catalog');
  return newProduct;
}

export async function updateProduct(id: string, data: Partial<Omit<Product, 'id'>>) {
  const productIndex = db.products.findIndex((product) => product.id === id);
  if (productIndex === -1) throw new Error('Product not found');

  const existing = db.products[productIndex];
  const slug = data.slug ? slugify(data.slug) : existing.slug;

  db.products[productIndex] = {
    ...existing,
    ...data,
    slug,
  };

  revalidatePath('/catalog');
  revalidatePath(`/product/${slug}`);

  return db.products[productIndex];
}

export async function deleteProduct(id: string) {
  const productIndex = db.products.findIndex((product) => product.id === id);
  if (productIndex === -1) throw new Error('Product not found');

  const [removed] = db.products.splice(productIndex, 1);
  revalidatePath('/catalog');
  return removed;
}
