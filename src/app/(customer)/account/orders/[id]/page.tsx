import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";
import { ArrowLeft, Package, MapPin, Truck, CheckCircle2 } from "lucide-react";

import { requireRole } from "@server/auth";
import { listOrdersByUser } from "@server/orders";
import { db } from "@server/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type OrderDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = await params;
  const user = await requireRole(["CUSTOMER"]);
  const orders = await listOrdersByUser(user.id);
  const order = orders.find((o) => o.id === id);

  if (!order) {
    notFound();
  }

  const statuses = [
    { id: "PENDING", label: "รอการชำระเงิน", icon: Package },
    { id: "PROCESSING", label: "กำลังจัดเตรียม", icon: Package },
    { id: "SHIPPED", label: "อยู่ระหว่างจัดส่ง", icon: Truck },
    { id: "DELIVERED", label: "จัดส่งสำเร็จ", icon: CheckCircle2 },
  ];

  const currentStatusIndex = statuses.findIndex((s) => s.id === order.status);
  const isCancelled = false; // "CANCELLED" not in OrderStatus yet

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-4 text-muted-foreground hover:text-foreground">
          <Link href={"/(customer)/account/orders" as Route<string>}>
            <ArrowLeft className="mr-2 h-4 w-4" /> กลับไปประวัติคำสั่งซื้อ
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">รายละเอียดคำสั่งซื้อ</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
              <span>•</span>
              สั่งซื้อเมื่อ {formatDate(order.createdAt ?? new Date().toISOString())}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={isCancelled ? "destructive" : order.status === "DELIVERED" ? "default" : "secondary"}
              className="text-sm"
            >
              {isCancelled ? "ยกเลิกแล้ว" : statuses[currentStatusIndex]?.label ?? order.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr,1fr]">
        <div className="space-y-8">
          {/* Tracking Timeline */}
          {!isCancelled && (
            <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-foreground">สถานะการจัดส่ง</h2>
              <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute left-0 top-5 -z-10 h-0.5 w-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(Math.max(currentStatusIndex, 0) / (statuses.length - 1)) * 100}%` }}
                  />
                </div>

                {statuses.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const StatusIcon = status.icon;

                  return (
                    <div key={status.id} className="flex flex-col items-center gap-2 text-center">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background transition-colors",
                          isCompleted ? "border-primary text-primary" : "border-muted text-muted-foreground",
                          isCurrent ? "ring-4 ring-primary/20" : ""
                        )}
                      >
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <span className={cn("text-xs font-medium sm:text-sm", isCompleted ? "text-foreground" : "text-muted-foreground")}>
                        {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Items */}
          <section className="rounded-2xl border border-border bg-background shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">รายการสินค้า ({order.items.length} ชิ้น)</h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-muted text-xs font-medium text-muted-foreground">
                    Item
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">จำนวน: {item.qty}</p>
                  </div>
                  <p className="font-medium text-foreground">{formatCurrency(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Summary */}
          <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">สรุปยอดชำระเงิน</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>ยอดสินค้า</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
               {order.status === 'PAID' ? (
                 <div className="flex justify-between text-muted-foreground">
                   <span>การชำระเงิน</span>
                   <span className="text-green-600 font-medium">จ่ายแล้ว</span>
                 </div>
               ) : (
                 <div className="flex justify-between text-muted-foreground">
                   <span>การชำระเงิน</span>
                   <span className="text-amber-600 font-medium">รอการชำระเงิน / เก็บเงินปลายทาง</span>
                 </div>
               )}
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
                <span>ยอดสุทธิ</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </section>

          {/* Shipping Details */}
          <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">ที่อยู่จัดส่ง</h2>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="mt-1">128 ถนนสุขุมวิท แขวงคลองตันเหนือ</p>
                <p>เขตวัฒนา กรุงเทพฯ 10110</p>
                <p className="mt-2 text-xs">เบอร์โทร: 089-555-6789</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
