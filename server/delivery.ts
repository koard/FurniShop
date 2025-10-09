'use server';

import { revalidatePath } from 'next/cache';
import { db } from './db';
import { DeliveryStatus } from '../types/enums';

export async function listTodayDeliveries(courierId: string, date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return db.deliveries.filter((delivery) => {
    const scheduled = new Date(delivery.scheduledDate);
    return (
      delivery.courierId === courierId &&
      scheduled >= startOfDay &&
      scheduled <= endOfDay
    );
  });
}

export async function setDeliveryStatus(
  deliveryId: string,
  status: DeliveryStatus,
  options: { note?: string; completedAt?: string } = {}
) {
  const delivery = db.deliveries.find((item) => item.id === deliveryId);
  if (!delivery) {
    throw new Error('Delivery task not found');
  }

  delivery.status = status;
  delivery.note = options.note;
  delivery.updatedAt = options.completedAt ?? new Date().toISOString();

  if (status === DeliveryStatus.Delivered) {
    const order = db.orders.find((entry) => entry.id === delivery.orderId);
    if (order) {
      order.status = 'DELIVERED';
      order.timeline.push({
        status: 'DELIVERED',
        at: delivery.updatedAt,
        note: options.note,
      });
    }
  }

  revalidatePath('/(delivery)/delivery');
  return delivery;
}
