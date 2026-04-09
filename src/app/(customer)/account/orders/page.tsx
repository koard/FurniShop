import Link from "next/link";
import type { Route } from "next";
import { requireRole } from "@server/auth";
import { Package, Heart, MapPin, User, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listOrdersByUser } from "@server/orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function OrdersPage() {
  const user = await requireRole(["CUSTOMER"]);
  const orders = await listOrdersByUser(user.id);

  async function handleSignOut() {
    "use server";
    const { signOut } = await import("@server/auth");
    await signOut();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-8 lg:flex-row lg:px-8">
      {/* Sidebar - Same as account overview */}
      <aside className="w-full shrink-0 space-y-2 lg:w-64">
        <div className="mb-6 px-3">
          <h1 className="text-2xl font-bold text-foreground">บัญชีของฉัน</h1>
          <p className="text-sm text-muted-foreground">{user.name}</p>
        </div>
        <nav className="flex flex-col gap-1">
          <Link
            href={"/(customer)/account" as Route<string>}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <User className="h-5 w-5" /> ภาพรวมบัญชี
          </Link>
          <Link
            href={"/(customer)/account/orders" as Route<string>}
            className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
          >
            <Package className="h-5 w-5" /> ประวัติคำสั่งซื้อ
          </Link>
          <Link
            href={"/wishlist" as Route<string>}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Heart className="h-5 w-5" /> รายการโปรด
          </Link>
          <form action={handleSignOut} className="mt-4 border-t border-border pt-4">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" /> ออกจากระบบ
            </button>
          </form>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-foreground">ประวัติคำสั่งซื้อทั้งหมด</h2>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
             <input
              type="text"
              placeholder="ค้นหาจากเลขคำสั่งซื้อ..."
              className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/80 bg-muted/30 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">คุณยังไม่มีประวัติคำสั่งซื้อ</h3>
              <p className="mt-1 text-sm text-muted-foreground">เลือกซื้อสินค้าที่ถูกใจเพื่อเริ่มตกแต่งบ้านของคุณ</p>
            </div>
            <Button asChild className="mt-2">
              <Link href={"/catalog" as Route<string>}>เริ่มช้อปเลย</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-border bg-background transition-shadow hover:shadow-sm"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/30 px-6 py-4">
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">วันสั่งซื้อ</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{formatDate(order.createdAt ?? new Date().toISOString())}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ยอดรวม</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{formatCurrency(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">หมายเลขคำสั่งซื้อ</p>
                      <p className="mt-1 font-mono text-sm font-medium text-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/(customer)/account/orders/${order.id}` as Route<string>}>ดูรายละเอียด</Link>
                    </Button>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="flex flex-col gap-6 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted">
                           {/* Using a placeholder since we don't have images in order items directly yet. In a real app we'd fetch product images. */}
                          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-medium text-primary">
                            Item
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-muted/50 text-xs font-medium text-muted-foreground">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-foreground">
                        {order.items[0].name}
                        {order.items.length > 1 ? ` และอื่นๆ อีก ${order.items.length - 1} รายการ` : ""}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <Badge
                      variant={order.status === "DELIVERED" ? "default" : "secondary"}
                      className={order.status === "PENDING" ? "bg-amber-100 text-amber-800" : ""}
                    >
                      {order.status}
                    </Badge>
                     {order.status === 'PAID' || order.status === 'SHIPPING' || order.status === 'DELIVERED' ? (
                       <span className="text-xs text-green-600 font-medium">ชำระเงินแล้ว</span>
                     ) : (
                       <span className="text-xs text-amber-600 font-medium">รอการชำระเงิน</span>
                     )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
