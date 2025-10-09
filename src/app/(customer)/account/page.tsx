import { requireRole } from "@server/auth";

export default async function AccountPage() {
  await requireRole(["CUSTOMER"]);
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-10">
      <h1 className="text-2xl font-semibold text-foreground">บัญชีของฉัน</h1>
      <p className="mt-2 text-muted-foreground">แดชบอร์ดลูกค้า อยู่ระหว่างพัฒนา</p>
    </div>
  );
}
