export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  size: string;
  material: string;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  stock: number;
  createdAt: string;
  description?: string;
  discountPercentage?: number;
  discountAmount?: number;
  tags?: string[];
};

export type ProductFilter = {
  q?: string;
  category?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  material?: string;
  materials?: string[];
  rating?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "top-rated";
  limit?: number;
  page?: number;
};

export type ProductSummary = Pick<
  Product,
  "id" | "slug" | "name" | "price" | "category" | "rating" | "reviewCount" | "images"
> & {
  discountedPrice?: number;
};
