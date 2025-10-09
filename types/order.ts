export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderTimelineEntry = {
  status: OrderStatus;
  at: string;
  note?: string;
  actor?: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  paymentRef?: string;
  status: OrderStatus;
  trackingCode?: string;
  timeline: OrderTimelineEntry[];
  shippingAddress?: string;
  billingAddress?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderFilters = {
  status?: OrderStatus;
  userId?: string;
  q?: string;
  page?: number;
  limit?: number;
};
