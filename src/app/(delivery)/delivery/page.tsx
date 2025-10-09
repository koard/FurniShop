import { requireRole } from "@server/auth";

export default async function DeliveryPage() {
  await requireRole(["DELIVERY"]);
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-10">
      <h1 className="text-2xl font-semibold text-foreground">งานจัดส่งวันนี้</h1>
      <p className="mt-2 text-muted-foreground">อยู่ระหว่างพัฒนา</p>
    </div>
  );
}
