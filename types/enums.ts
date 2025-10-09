export const SUPPORTED_LOCALES = ["th", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export enum DeliveryStatus {
  PendingPickup = "PENDING_PICKUP",
  InTransit = "IN_TRANSIT",
  OutForDelivery = "OUT_FOR_DELIVERY",
  Delivered = "DELIVERED",
  Failed = "FAILED",
}

export enum ToastVariant {
  Success = "success",
  Error = "error",
  Info = "info",
  Warning = "warning",
}
