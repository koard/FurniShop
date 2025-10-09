import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { CreditCard, ShoppingBag } from "lucide-react";

import { loadCartLines } from "@/lib/cart-data";
import { getSession } from "@server/auth";
import { db } from "@server/db";
import { createOrder } from "@server/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default async function CheckoutPage() {
  const { lines, subtotal } = await loadCartLines();
  const shipping = subtotal > 0 ? 250 : 0;
  const tax = subtotal > 0 ? subtotal * 0.07 : 0;
  const total = subtotal + shipping + tax;

  async function placeOrderAction(formData: FormData) {
    "use server";
    const session = await getSession();
    const fallbackCustomer = db.users.find((user) => user.role === "CUSTOMER");
    const userId = session?.user?.id ?? fallbackCustomer?.id;
    if (!userId) return;
    const promotionCode = String(formData.get("promotionCode") ?? "").trim() || undefined;
    await createOrder({ userId, promotionCode });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">ชำระเงิน</h1>
          <p className="text-sm text-muted-foreground">
            กรอกข้อมูลการจัดส่งและการชำระเงิน จากนั้นตรวจสอบรายการสั่งซื้อก่อนยืนยัน
          </p>
        </div>
        <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
          <ShoppingBag className="h-4 w-4" />
          {lines.length} รายการในตะกร้า
        </Badge>
      </div>

      {lines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-base text-muted-foreground">
            ยังไม่มีสินค้าในตะกร้า กลับไปเลือกสินค้าที่คุณชอบก่อน แล้วค่อยกลับมาชำระเงินอีกครั้ง
          </p>
          <Button className="mt-6" asChild>
            <Link href={"/catalog" as Route<string>}>เลือกสินค้า</Link>
          </Button>
        </div>
      ) : (
  <form action={placeOrderAction} className="grid gap-10 lg:grid-cols-[1.3fr,1fr]">
          <div className="space-y-8 rounded-2xl border border-border bg-background p-6 shadow-sm">
            <div className="space-y-4 border-b border-border pb-6">
              <h2 className="text-xl font-semibold text-foreground">ข้อมูลผู้รับสินค้า</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="full-name" className="text-sm font-medium text-foreground">
                    ชื่อ-นามสกุล
                  </label>
                  <Input id="full-name" name="full-name" defaultValue="Nina Chokdee" placeholder="ชื่อจริง" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    เบอร์โทรศัพท์
                  </label>
                  <Input id="phone" name="phone" defaultValue="089 555 6789" placeholder="081-234-5678" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="address" className="text-sm font-medium text-foreground">
                    ที่อยู่จัดส่ง
                  </label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue="128 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110"
                    placeholder="บ้านเลขที่ / ถนน / แขวง / เขต / จังหวัด / รหัสไปรษณีย์"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium text-foreground">
                    จังหวัด
                  </label>
                  <Input id="city" name="city" defaultValue="กรุงเทพมหานคร" placeholder="จังหวัด" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="postal" className="text-sm font-medium text-foreground">
                    รหัสไปรษณีย์
                  </label>
                  <Input id="postal" name="postal" defaultValue="10110" placeholder="10110" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">ช่องทางการชำระเงิน</h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 transition hover:border-primary">
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CreditCard className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-foreground">บัตรเครดิต / เดบิต</span>
                  </span>
                  <input type="radio" name="payment" defaultChecked className="h-4 w-4 text-primary" />
                </label>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 transition hover:border-primary">
                  <span className="text-sm font-medium text-foreground">โอนผ่านแอปธนาคาร</span>
                  <input type="radio" name="payment" className="h-4 w-4 text-primary" />
                </label>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 transition hover:border-primary">
                  <span className="text-sm font-medium text-foreground">เก็บเงินปลายทาง</span>
                  <input type="radio" name="payment" className="h-4 w-4 text-primary" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="card-number" className="text-sm font-medium text-foreground">
                    เลขบัตร
                  </label>
                  <Input id="card-number" name="card-number" placeholder="0000 0000 0000 0000" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="card-name" className="text-sm font-medium text-foreground">
                    ชื่อบนบัตร
                  </label>
                  <Input id="card-name" name="card-name" placeholder="ชื่อ-นามสกุล" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="card-exp" className="text-sm font-medium text-foreground">
                    วันหมดอายุ (MM/YY)
                  </label>
                  <Input id="card-exp" name="card-exp" placeholder="08/27" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="card-cvv" className="text-sm font-medium text-foreground">
                    CVV
                  </label>
                  <Input id="card-cvv" name="card-cvv" placeholder="123" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground" htmlFor="promotionCode">โค้ดส่วนลด (ถ้ามี)</label>
              <Input id="promotionCode" name="promotionCode" placeholder="WELCOME10" />
            </div>
            <Button size="lg" type="submit" className="w-full">
              ชำระเงิน {formatCurrency(total)}
            </Button>
          </div>

          <aside className="space-y-6 rounded-2xl border border-border bg-muted/40 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">สรุปคำสั่งซื้อ</h2>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                รวม {lines.reduce((sum, line) => sum + line.qty, 0)} ชิ้น
              </Badge>
            </div>
            <div className="space-y-4">
              {lines.map((line) => (
                <div key={line.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border/80">
                    <Image src={line.image} alt={line.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{line.name}</p>
                    <p className="text-xs text-muted-foreground">{line.qty} x {formatCurrency(line.price)}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(line.price * line.qty)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>ยอดสินค้า</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>ค่าจัดส่ง</span>
                <span>{shipping === 0 ? "ฟรี" : formatCurrency(shipping)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>ภาษี (7%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4 text-base font-semibold text-foreground">
              <span>ยอดที่ต้องชำระ</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="rounded-xl bg-background/60 p-4 text-xs text-muted-foreground">
              - ส่งฟรีทั่วประเทศเมื่อยอดสั่งซื้อเกิน 5,000 บาท <br />- สามารถคืนสินค้าได้ภายใน 7 วัน หากสินค้าเสียหายหรือไม่ตรงตามสเปก
            </div>
          </aside>
        </form>
      )}
    </div>
  );
}
