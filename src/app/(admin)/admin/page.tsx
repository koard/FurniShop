import Link from "next/link";
import { AlertTriangle, ArrowRight, Boxes, Percent, ReceiptText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatCard } from "@/components/cards/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@server/db";

export default async function AdminPage() {
  // Compute simple stats from current data
  const orders = db.orders;
  const products = db.products;
  const promotions = db.promotions.filter((p) => p.active);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const totalOrders = orders.length;
  const lowStock = products.filter((p) => p.stock != null && p.stock <= 5).length;
  const activePromotions = promotions.length;

  const latestOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 5);

  // Rough fulfillment rate mock based on statuses
  const delivered = orders.filter((o) => String(o.status).toUpperCase().includes("DELIVERED")).length;

  const toRoute = (href: string) => href as unknown as import("next").Route<string>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">ภาพรวมระบบ</h1>
        <p className="mt-1 text-sm text-muted-foreground">สรุปตัวชี้วัดหลักและคำสั่งซื้อล่าสุด</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="รายได้รวม" value={formatCurrency(totalRevenue)} helper={"รวมทุกคำสั่งซื้อ"} icon={<ReceiptText className="h-5 w-5" />} />
        <StatCard label="จำนวนออเดอร์" value={totalOrders} helper={`สำเร็จ ${delivered} รายการ`} icon={<Boxes className="h-5 w-5" />} />
        <StatCard label="โปรโมชันใช้งาน" value={activePromotions} helper="กำลังแสดงผลในร้าน" icon={<Percent className="h-5 w-5" />} />
        <StatCard label="สินค้าใกล้หมด" value={lowStock} helper={"<= 5 ชิ้น"} icon={<AlertTriangle className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-5">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">ออเดอร์ล่าสุด</h2>
                <p className="text-sm text-muted-foreground">5 รายการล่าสุดตามเวลา</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={toRoute("/(admin)/admin/orders")}>ดูทั้งหมด</Link>
              </Button>
            </div>
            <div className="px-5 pb-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>เลขที่</TableHead>
                    <TableHead>ลูกค้า</TableHead>
                    <TableHead>ยอดรวม</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>วันที่</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestOrders.map((o) => {
                    const user = db.users.find((u) => u.id === o.userId);
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">{o.id.slice(-6).toUpperCase()}</TableCell>
                        <TableCell>{user?.name ?? "-"}</TableCell>
                        <TableCell>{formatCurrency(o.total)}</TableCell>
                        <TableCell className="text-xs uppercase text-muted-foreground">{String(o.status).replaceAll("_", " ")}</TableCell>
                        <TableCell>{o.createdAt ? formatDate(o.createdAt) : "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="text-base font-semibold">ทางลัดการจัดการ</h3>
              <div className="mt-3 grid gap-2">
                <Button asChild variant="secondary" className="justify-between">
                  <Link href={toRoute("/(admin)/admin/products")}>
                    จัดการสินค้า <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="justify-between">
                  <Link href={toRoute("/(admin)/admin/orders")}>
                    จัดการคำสั่งซื้อ <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="justify-between">
                  <Link href={toRoute("/(admin)/admin/promotions")}>
                    จัดการโปรโมชัน <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
