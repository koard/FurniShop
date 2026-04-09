import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { loadCartLines } from "@/lib/cart-data";
import { getSession } from "@server/auth";
import { db } from "@server/db";
import { removeFromCart, updateQty } from "@server/cart";
import { formatCurrency } from "@/lib/utils";

export default async function CartPage() {
  const { lines, subtotal } = await loadCartLines();
  const voucherDiscount = subtotal > 0 ? subtotal * 0.1 : 0;
  const grandTotal = Math.max(subtotal - voucherDiscount, 0);
  const FREE_SHIPPING_THRESHOLD = 5000;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  // Server actions to mutate cart
  async function incrementAction(formData: FormData) {
    "use server";
    const session = await getSession();
    const fallbackCustomer = db.users.find((user) => user.role === "CUSTOMER");
    const userId = session?.user?.id ?? fallbackCustomer?.id;
    if (!userId) return;
    const productId = String(formData.get("productId"));
    const qty = Number(formData.get("qty"));
    await updateQty(userId, productId, qty + 1);
  }

  async function decrementAction(formData: FormData) {
    "use server";
    const session = await getSession();
    const fallbackCustomer = db.users.find((user) => user.role === "CUSTOMER");
    const userId = session?.user?.id ?? fallbackCustomer?.id;
    if (!userId) return;
    const productId = String(formData.get("productId"));
    const qty = Number(formData.get("qty"));
    await updateQty(userId, productId, Math.max(qty - 1, 0));
  }

  async function removeAction(formData: FormData) {
    "use server";
    const session = await getSession();
    const fallbackCustomer = db.users.find((user) => user.role === "CUSTOMER");
    const userId = session?.user?.id ?? fallbackCustomer?.id;
    if (!userId) return;
    const productId = String(formData.get("productId"));
    await removeFromCart(userId, productId);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">ตะกร้าสินค้า</h1>
          <p className="text-sm text-muted-foreground">
            ตรวจสอบสินค้า ปรับจำนวน หรือใช้โค้ดส่วนลดก่อนดำเนินการชำระเงิน
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={"/catalog" as Route<string>}>เลือกสินค้าเพิ่มเติม</Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border border-border bg-background shadow-sm">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <p className="text-lg font-medium text-foreground">ตะกร้าของคุณยังว่างอยู่</p>
              <p className="text-sm text-muted-foreground">
                เริ่มต้นเลือกเฟอร์นิเจอร์ที่ใช่สำหรับบ้านของคุณได้เลยที่หน้ารวมสินค้า
              </p>
              <Button asChild>
                <Link href={"/catalog" as Route<string>}>เริ่มช้อปเลย</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>สินค้า</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">ราคา</TableHead>
                  <TableHead className="text-center">จำนวน</TableHead>
                  <TableHead className="text-right">รวม</TableHead>
                  <TableHead className="sr-only">ลบ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => {
                  const lineTotal = line.price * line.qty;
                  const savings = Math.max((line.originalPrice - line.price) * line.qty, 0);
                  return (
                    <TableRow key={line.id} className="border-border/70">
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border/80">
                            <Image
                              src={line.image}
                              alt={line.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                          <div className="space-y-1">
                            <Link
                              href={`/product/${line.slug}` as Route<string>}
                              className="text-sm font-semibold text-foreground hover:text-primary"
                            >
                              {line.name}
                            </Link>
                            {line.description ? (
                              <p className="line-clamp-2 text-xs text-muted-foreground">{line.description}</p>
                            ) : null}
                            {line.originalPrice > line.price ? (
                              <Badge variant="secondary" className="bg-primary/10 text-[10px] text-primary">
                                ประหยัด {formatCurrency(line.originalPrice - line.price)} ต่อชิ้น
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-right text-sm font-medium text-foreground sm:table-cell">
                        {formatCurrency(line.price)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border px-2 py-1">
                          <form action={decrementAction}>
                            <input type="hidden" name="productId" value={line.id} />
                            <input type="hidden" name="qty" value={line.qty} />
                            <Button variant="ghost" size="icon" className="h-7 w-7" type="submit" aria-label="ลดจำนวน">
                              <Minus className="h-4 w-4" />
                            </Button>
                          </form>
                          <span className="min-w-[2ch] text-sm font-medium">{line.qty}</span>
                          <form action={incrementAction}>
                            <input type="hidden" name="productId" value={line.id} />
                            <input type="hidden" name="qty" value={line.qty} />
                            <Button variant="ghost" size="icon" className="h-7 w-7" type="submit" aria-label="เพิ่มจำนวน">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-foreground">
                        {formatCurrency(lineTotal)}
                        {savings > 0 ? (
                          <div className="text-xs text-success">ประหยัด {formatCurrency(savings)}</div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <form action={removeAction}>
                          <input type="hidden" name="productId" value={line.id} />
                          <Button variant="ghost" size="icon" type="submit" aria-label="นำออก">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <aside className="h-fit space-y-6 rounded-2xl border border-border bg-muted/40 p-6 shadow-sm">
          {/* Free shipping progress bar */}
          {lines.length > 0 && (
            <div className="space-y-2 rounded-xl border border-border bg-background/60 px-4 py-3">
              {remainingForFreeShipping > 0 ? (
                <p className="text-xs text-muted-foreground">
                  ซื้อเพิ่มอีก{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(remainingForFreeShipping)}
                  </span>{" "}
                  เพื่อรับ <span className="font-semibold text-green-600">จัดส่งฟรี!</span>
                </p>
              ) : (
                <p className="text-xs font-semibold text-green-600">คุณได้รับสิทธิ์จัดส่งฟรีแล้ว!</p>
              )}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">สรุปคำสั่งซื้อ</h2>
            <Badge variant="secondary" className="bg-primary/10 text-xs text-primary">
              โค้ด: WELCOME10
            </Badge>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ยอดรวมสินค้า</span>
              <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ส่วนลด (10%)</span>
              <span className="font-medium text-destructive">- {formatCurrency(voucherDiscount)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-foreground">
              <span>ยอดชำระทั้งหมด</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
          <Button asChild size="lg" disabled={lines.length === 0}>
            <Link href={"/checkout" as Route<string>}>ดำเนินการชำระเงิน</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            * ค่าจัดส่งคำนวณตามปลายทาง และอาจมีค่าบริการเพิ่มเติมสำหรับการประกอบ
          </p>
        </aside>
      </div>
    </div>
  );
}
