import { ShoppingBag } from 'lucide-react';
import { loadCartLines } from '@/lib/cart-data';
import { Badge } from '@/components/ui/badge';
import CheckoutForm from './checkout-form';

export default async function CheckoutPage() {
  const { lines, subtotal } = await loadCartLines();
  const shipping = subtotal > 0 ? 250 : 0;
  const tax = subtotal > 0 ? subtotal * 0.07 : 0;
  const total = subtotal + shipping + tax;

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

      <CheckoutForm
        lines={lines}
        subtotal={subtotal}
        shipping={shipping}
        tax={tax}
        total={total}
      />
    </div>
  );
}
