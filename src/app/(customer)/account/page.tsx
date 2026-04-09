import Link from "next/link";
import type { Route } from "next";
import { requireRole } from "@server/auth";
import { Package, Heart, MapPin, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listOrdersByUser } from "@server/orders";
import { db } from "@server/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AccountPage() {
  const user = await requireRole(["CUSTOMER"]);
  const orders = await listOrdersByUser(user.id);
  const recentOrders = orders.slice(0, 3);

  async function handleSignOut() {
    "use server";
    const { signOut } = await import("@server/auth");
    await signOut();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-8 lg:flex-row lg:px-8">
      {/* Sidebar */}
      <aside className="w-full shrink-0 space-y-2 lg:w-64">
        <div className="mb-6 px-3">
          <h1 className="text-2xl font-bold text-foreground">บัญชีของฉัน</h1>
          <p className="text-sm text-muted-foreground">{user.name}</p>
        </div>
        <nav className="flex flex-col gap-1">
          <Link
            href={"/account" as Route<string>}
            className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
          >
            <User className="h-5 w-5" /> ภาพรวมบัญชี
          </Link>
          <Link
            href={"/account/orders" as Route<string>}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
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
      <div className="flex-1 space-y-8">
        {/* Profile Card */}
        <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">ข้อมูลส่วนตัว</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">ชื่อ-นามสกุล</p>
              <p className="font-medium text-foreground">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">อีเมล</p>
              <p className="font-medium text-foreground">{user.email}</p>
            </div>
          </div>
        </section>

        {/* Recent Orders */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">คำสั่งซื้อล่าสุด</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={"/account/orders" as Route<string>}>ดูทั้งหมด</Link>
            </Button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-8 text-center text-muted-foreground">
              คุณยังไม่มีประวัติการสั่งซื้อ
            </div>
          ) : (
            <div className="grid gap-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}` as Route<string>}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 transition hover:border-primary/50 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-mono font-medium text-foreground">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <Badge
                        variant={order.status === "DELIVERED" ? "default" : "secondary"}
                        className={order.status === "PENDING" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : ""}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatDate(order.createdAt ?? new Date().toISOString())}</span>
                      <span>•</span>
                      <span>{order.items.length} รายการ</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-1">
                    <p className="font-semibold text-foreground">{formatCurrency(order.total)}</p>
                    <span className="text-sm font-medium text-primary hover:underline">
                      ดูรายละเอียด →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
