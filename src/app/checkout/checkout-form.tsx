'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import {
  CreditCard,
  ShoppingBag,
  Smartphone,
  Truck,
  ChevronDown,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { CartLine } from '@/lib/cart-data';

// ---------------------------------------------------------------------------
// Omise.js global types
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    Omise: {
      setPublicKey: (key: string) => void;
      createToken: (
        type: 'card',
        cardData: {
          name: string;
          number: string;
          expiration_month: number;
          expiration_year: number;
          security_code: string;
        },
        callback: (statusCode: number, response: OmiseTokenResponse) => void,
      ) => void;
    };
  }
}

interface OmiseTokenResponse {
  id?: string;
  object?: string;
  code?: string;
  message?: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface CheckoutFormProps {
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cod';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseExpiry(raw: string): { month: number; year: number } | null {
  const parts = raw.replace(/\s/g, '').split('/');
  if (parts.length !== 2) return null;
  const month = parseInt(parts[0], 10);
  let year = parseInt(parts[1], 10);
  if (year < 100) year += 2000;
  if (isNaN(month) || isNaN(year)) return null;
  return { month, year };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CheckoutForm({
  lines,
  subtotal,
  shipping,
  tax,
  total,
}: CheckoutFormProps) {
  const router = useRouter();
  const omiseReady = useRef(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderId: string; chargeId: string } | null>(null);
  const [showTestCards, setShowTestCards] = useState(false);

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [promotionCode, setPromotionCode] = useState('');

  // Load omise.js
  useEffect(() => {
    if (omiseReady.current) return;
    const script = document.createElement('script');
    script.src = 'https://cdn.omise.co/omise.js';
    script.async = true;
    script.onload = () => {
      omiseReady.current = true;
    };
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  // Format card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(raw.replace(/(.{4})/g, '$1 ').trim());
  };

  // Format expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length > 2) raw = raw.slice(0, 2) + '/' + raw.slice(2);
    setCardExpiry(raw);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (paymentMethod === 'bank_transfer' || paymentMethod === 'cod') {
      // Mockup — just create order without payment
      setLoading(true);
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: '__cod__',
            amount: total,
            promotionCode: promotionCode.trim() || undefined,
            note: paymentMethod === 'cod' ? 'เก็บเงินปลายทาง' : 'โอนผ่านแอป',
          }),
        });
        const data = await res.json() as { success: boolean; orderId?: string; chargeId?: string; error?: string };
        if (data.success && data.orderId) {
          setSuccess({ orderId: data.orderId, chargeId: data.chargeId ?? '' });
          setTimeout(() => router.push(`/` as Route<string>), 2000);
        } else {
          setError(data.error ?? 'เกิดข้อผิดพลาด');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // Credit card — tokenize first
    if (!window.Omise) {
      setError('กำลังโหลดระบบชำระเงิน กรุณารอสักครู่แล้วลองใหม่');
      return;
    }

    const rawNumber = cardNumber.replace(/\s/g, '');
    if (rawNumber.length < 13) { setError('กรุณากรอกเลขบัตรให้ครบ'); return; }
    if (!cardName.trim()) { setError('กรุณากรอกชื่อบนบัตร'); return; }
    const expiry = parseExpiry(cardExpiry);
    if (!expiry) { setError('รูปแบบวันหมดอายุไม่ถูกต้อง (MM/YY)'); return; }
    if (!cardCvv || cardCvv.length < 3) { setError('กรุณากรอก CVV ให้ครบ'); return; }

    const publicKey = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY;
    if (!publicKey || publicKey.startsWith('pkey_test_xxx')) {
      setError('ยังไม่ได้ตั้งค่า OMISE_PUBLIC_KEY ใน .env.local');
      return;
    }

    setLoading(true);

    window.Omise.setPublicKey(publicKey);
    window.Omise.createToken(
      'card',
      {
        name: cardName.trim(),
        number: rawNumber,
        expiration_month: expiry.month,
        expiration_year: expiry.year,
        security_code: cardCvv,
      },
      async (statusCode, response) => {
        if (statusCode !== 200 || !response.id) {
          setError(response.message ?? 'ข้อมูลบัตรไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
          setLoading(false);
          return;
        }

        try {
          const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: response.id,
              amount: total,
              promotionCode: promotionCode.trim() || undefined,
            }),
          });
          const data = await res.json() as { success: boolean; orderId?: string; chargeId?: string; error?: string };
          if (data.success && data.orderId) {
            setSuccess({ orderId: data.orderId, chargeId: data.chargeId ?? '' });
            setTimeout(() => router.push(`/` as Route<string>), 3000);
          } else {
            setError(data.error ?? 'การชำระเงินล้มเหลว');
          }
        } catch {
          setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่');
        } finally {
          setLoading(false);
        }
      },
    );
  };

  // ── Success State ──────────────────────────────────────────────────
  if (success) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">ชำระเงินสำเร็จ! 🎉</h2>
          <p className="mt-2 text-muted-foreground">คำสั่งซื้อของคุณถูกบันทึกแล้ว</p>
        </div>
        <div className="w-full rounded-xl border border-border bg-muted/40 p-4 text-left text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">หมายเลขออร์เดอร์</span>
            <span className="font-mono font-semibold">{success.orderId.slice(0, 8).toUpperCase()}</span>
          </div>
          {success.chargeId && (
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Charge ID</span>
              <span className="font-mono text-xs text-muted-foreground">{success.chargeId}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">กำลังพาคุณกลับหน้าหลัก...</p>
      </div>
    );
  }

  // ── Empty Cart ─────────────────────────────────────────────────────
  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="text-base text-muted-foreground">
          ยังไม่มีสินค้าในตะกร้า กลับไปเลือกสินค้าที่คุณชอบก่อน แล้วค่อยกลับมาชำระเงินอีกครั้ง
        </p>
        <Button className="mt-6" asChild>
          <Link href={'/catalog' as Route<string>}>เลือกสินค้า</Link>
        </Button>
      </div>
    );
  }

  // ── Main Form ──────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1.3fr,1fr]">
      {/* ── Left column ─────────────────────────────────────────── */}
      <div className="space-y-8 rounded-2xl border border-border bg-background p-6 shadow-sm">

        {/* Shipping info */}
        <div className="space-y-4 border-b border-border pb-6">
          <h2 className="text-xl font-semibold text-foreground">ข้อมูลผู้รับสินค้า</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="full-name" className="text-sm font-medium text-foreground">ชื่อ-นามสกุล</label>
              <Input id="full-name" name="full-name" defaultValue="Nina Chokdee" placeholder="ชื่อจริง" />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">เบอร์โทรศัพท์</label>
              <Input id="phone" name="phone" defaultValue="089 555 6789" placeholder="081-234-5678" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="address" className="text-sm font-medium text-foreground">ที่อยู่จัดส่ง</label>
              <Input
                id="address"
                name="address"
                defaultValue="128 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110"
                placeholder="บ้านเลขที่ / ถนน / แขวง / เขต / จังหวัด / รหัสไปรษณีย์"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium text-foreground">จังหวัด</label>
              <Input id="city" name="city" defaultValue="กรุงเทพมหานคร" placeholder="จังหวัด" />
            </div>
            <div className="space-y-2">
              <label htmlFor="postal" className="text-sm font-medium text-foreground">รหัสไปรษณีย์</label>
              <Input id="postal" name="postal" defaultValue="10110" placeholder="10110" />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">ช่องทางการชำระเงิน</h2>
          <div className="space-y-3">
            {/* Credit card */}
            <label
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                paymentMethod === 'credit_card'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">บัตรเครดิต / เดบิต</span>
                  <span className="text-xs text-muted-foreground">ชำระผ่าน Omise (Visa, Mastercard, JCB)</span>
                </span>
              </span>
              <input
                type="radio"
                name="payment"
                value="credit_card"
                checked={paymentMethod === 'credit_card'}
                onChange={() => setPaymentMethod('credit_card')}
                className="h-4 w-4 text-primary"
              />
            </label>

            {/* Bank transfer */}
            <label
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                paymentMethod === 'bank_transfer'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                  <Smartphone className="h-5 w-5" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">โอนผ่านแอปธนาคาร</span>
                  <span className="text-xs text-muted-foreground">PromptPay / Mobile Banking</span>
                </span>
              </span>
              <input
                type="radio"
                name="payment"
                value="bank_transfer"
                checked={paymentMethod === 'bank_transfer'}
                onChange={() => setPaymentMethod('bank_transfer')}
                className="h-4 w-4 text-primary"
              />
            </label>

            {/* COD */}
            <label
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                paymentMethod === 'cod'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <Truck className="h-5 w-5" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">เก็บเงินปลายทาง</span>
                  <span className="text-xs text-muted-foreground">ชำระเมื่อรับสินค้า (+50 บาท)</span>
                </span>
              </span>
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="h-4 w-4 text-primary"
              />
            </label>
          </div>

          {/* Credit card fields */}
          {paymentMethod === 'credit_card' && (
            <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
              {/* Sandbox test card hint */}
              <button
                type="button"
                onClick={() => setShowTestCards((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg bg-blue-500/10 px-3 py-2 text-left text-xs font-medium text-blue-600 transition hover:bg-blue-500/15"
              >
                <span className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" />
                  🧪 Sandbox Mode — ใช้บัตรทดสอบ
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showTestCards ? 'rotate-180' : ''}`}
                />
              </button>
              {showTestCards && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  <p className="mb-1 font-semibold">Test Cards (ใช้ได้เฉพาะ sandbox):</p>
                  <div className="space-y-1 font-mono">
                    <p>✅ <span className="font-bold">4242 4242 4242 4242</span> — Visa (สำเร็จ)</p>
                    <p>✅ <span className="font-bold">5555 5555 5555 4444</span> — Mastercard (สำเร็จ)</p>
                    <p>❌ <span className="font-bold">4111 1111 1111 1111</span> — Visa (ถูกปฏิเสธ)</p>
                    <p className="mt-1 text-blue-500">วันหมดอายุ: ใดก็ได้ในอนาคต | CVV: ใดก็ได้ 3 ตัว</p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="card-number" className="text-sm font-medium text-foreground">เลขบัตร</label>
                  <Input
                    id="card-number"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    autoComplete="cc-number"
                    inputMode="numeric"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="card-name" className="text-sm font-medium text-foreground">ชื่อบนบัตร</label>
                  <Input
                    id="card-name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="NINA CHOKDEE"
                    autoComplete="cc-name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="card-exp" className="text-sm font-medium text-foreground">วันหมดอายุ (MM/YY)</label>
                  <Input
                    id="card-exp"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="08/27"
                    maxLength={5}
                    autoComplete="cc-exp"
                    inputMode="numeric"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="card-cvv" className="text-sm font-medium text-foreground">CVV</label>
                  <Input
                    id="card-cvv"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    autoComplete="cc-csc"
                    inputMode="numeric"
                    type="password"
                  />
                </div>
              </div>

              {/* SSL badge */}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                ข้อมูลบัตรถูกเข้ารหัสด้วย SSL และส่งตรงไปยัง Omise — ระบบไม่เก็บข้อมูลบัตรของท่าน
              </p>
            </div>
          )}
        </div>

        {/* Promo code */}
        <div className="space-y-2">
          <label htmlFor="promotionCode" className="text-sm font-medium text-foreground">
            โค้ดส่วนลด (ถ้ามี)
          </label>
          <Input
            id="promotionCode"
            value={promotionCode}
            onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
            placeholder="WELCOME10"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Submit */}
        <Button size="lg" type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังดำเนินการ...</>
          ) : (
            <><Lock className="mr-2 h-4 w-4" /> ชำระเงิน {formatCurrency(total)}</>
          )}
        </Button>
      </div>

      {/* ── Right column: Order summary ──────────────────────────── */}
      <aside className="space-y-6 rounded-2xl border border-border bg-muted/40 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">สรุปคำสั่งซื้อ</h2>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            รวม {lines.reduce((s, l) => s + l.qty, 0)} ชิ้น
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
            <span>ยอดสินค้า</span><span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>ค่าจัดส่ง</span>
            <span>{shipping === 0 ? 'ฟรี' : formatCurrency(shipping)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>ภาษี (7%)</span><span>{formatCurrency(tax)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4 text-base font-semibold text-foreground">
          <span>ยอดที่ต้องชำระ</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="rounded-xl bg-background/60 p-4 text-xs text-muted-foreground">
          - ส่งฟรีทั่วประเทศเมื่อยอดสั่งซื้อเกิน 5,000 บาท<br />
          - สามารถคืนสินค้าได้ภายใน 7 วัน หากสินค้าเสียหายหรือไม่ตรงตามสเปก
        </div>
      </aside>
    </form>
  );
}
