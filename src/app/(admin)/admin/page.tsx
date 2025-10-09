import { requireRole } from "@server/auth";

export default async function AdminPage() {
  await requireRole(["ADMIN"]);
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10">
      <h1 className="text-2xl font-semibold text-foreground">แอดมินแดชบอร์ด</h1>
      <p className="mt-2 text-muted-foreground">อยู่ระหว่างพัฒนา</p>
    </div>
  );
}
