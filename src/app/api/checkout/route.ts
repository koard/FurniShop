import { NextResponse } from 'next/server';
import omise from 'omise';
import { getSession } from '@server/auth';
import { db } from '@server/db';
import { createOrder } from '@server/orders';

const omiseClient = omise({
  secretKey: process.env.OMISE_SECRET_KEY ?? '',
  omiseVersion: '2019-05-29',
});

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      token: string;
      amount: number;         // in THB (e.g. 1295.75)
      promotionCode?: string;
      note?: string;
    };

    const { token, amount, promotionCode, note } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบ payment token' },
        { status: 400 },
      );
    }

    // หา userId จาก session หรือ fallback customer
    const session = await getSession();
    const fallbackCustomer = db.users.find((u) => u.role === 'CUSTOMER');
    const userId = session?.user?.id ?? fallbackCustomer?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบ userId' },
        { status: 401 },
      );
    }

    // ── COD / Bank transfer (no real charge) ────────────────────────
    if (token === '__cod__' || token === '__bank__') {
      const result = await createOrder({
        userId,
        paymentRef: undefined,
        promotionCode,
        note,
        paymentStatus: 'PENDING',
      });

      return NextResponse.json({
        success: true,
        orderId: result.order.id,
        chargeId: '',
        total: result.total,
      });
    }

    // ── Credit card via Omise ────────────────────────────────────────
    if (!process.env.OMISE_SECRET_KEY || process.env.OMISE_SECRET_KEY.includes('skey_test_xxx')) {
      return NextResponse.json(
        { success: false, error: 'ยังไม่ได้ตั้งค่า OMISE_SECRET_KEY ใน .env.local — กรุณาใส่ key จาก Omise Dashboard' },
        { status: 500 },
      );
    }

    // Omise ใช้หน่วย สตางค์ (1 THB = 100 สตางค์)
    const amountInSatang = Math.round(amount * 100);

    const charge = await omiseClient.charges.create({
      amount: amountInSatang,
      currency: 'thb',
      card: token,
      capture: true,
      description: 'FurniShop Order',
      metadata: { promotionCode: promotionCode ?? '' },
    });

    if (charge.status !== 'successful' || !charge.paid) {
      return NextResponse.json(
        {
          success: false,
          error: charge.failure_message ?? 'การชำระเงินถูกปฏิเสธโดยธนาคาร',
          failureCode: charge.failure_code,
        },
        { status: 402 },
      );
    }

    const result = await createOrder({
      userId,
      paymentRef: charge.id,
      promotionCode,
      note,
      paymentStatus: 'PAID',
    });

    return NextResponse.json({
      success: true,
      orderId: result.order.id,
      chargeId: charge.id,
      total: result.total,
      lastDigits: charge.card?.last_digits,
      cardBrand: charge.card?.brand,
    });
  } catch (err: unknown) {
    console.error('[checkout/route] error:', err);
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
