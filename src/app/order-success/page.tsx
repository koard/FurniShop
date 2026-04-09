import Link from "next/link";
import type { Route } from "next";
import { CheckCircle2, Package, ArrowRight, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";

type OrderSuccessPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const resolvedParams = await searchParams;
  const orderId = typeof resolvedParams.orderId === "string" ? resolvedParams.orderId : undefined;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-500">
        <CheckCircle2 className="h-12 w-12" />
      </div>
      
      <h1 className="mb-2 text-4xl font-bold text-foreground">ชำระเงินสำเร็จ!</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        ขอบคุณสำหรับการสั่งซื้อ ทางเราได้รับรายการคำสั่งซื้อของคุณเรียบร้อยแล้ว
      </p>

      <div className="mb-8 flex flex-col gap-4 w-full max-w-sm rounded-2xl border border-border bg-muted/30 p-6 text-left">
        {orderId ? (
          <div>
            <span className="text-xs text-muted-foreground">หมายเลขคำสั่งซื้อ</span>
            <p className="font-mono font-medium text-foreground">{orderId}</p>
          </div>
        ) : null}
        <div>
          <span className="text-xs text-muted-foreground">สถานะ</span>
          <p className="flex items-center gap-1.5 text-sm font-medium text-indigo-600">
            <Truck className="h-4 w-4" /> เตรียมจัดส่ง
          </p>
        </div>
        <div className="rounded-lg bg-background p-3 text-sm text-muted-foreground">
          เราจะส่งอีเมลยืนยันการสั่งซื้อและรายละเอียดการจัดส่งไปให้คุณในเร็วๆ นี้
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="min-w-[160px]">
          <Link href={"/account/orders" as Route<string>}>
            <Package className="mr-2 h-4 w-4" /> ดูออร์เดอร์ของฉัน
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="min-w-[160px]">
          <Link href={"/catalog" as Route<string>}>
            กลับไปช้อปปิ้ง <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
