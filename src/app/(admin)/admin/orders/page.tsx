import { requireRole } from "@server/auth";
import { PageHeader } from "@/components/layout/page-header";

export default async function AdminOrdersPage() {
  await requireRole(["ADMIN"]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการคำสั่งซื้อ"
        subtitle="หน้าจัดการคำสั่งซื้อ (กำลังพัฒนา)"
        breadcrumbs={[
          { label: "แดชบอร์ด", href: "/(admin)/admin" as unknown as import("next").Route<string> },
          { label: "คำสั่งซื้อ" },
        ]}
      />
      <p className="text-muted-foreground">หน้านี้จะรองรับการค้นหา/กรอง/อัปเดตสถานะคำสั่งซื้อ</p>
    </div>
  );
}
