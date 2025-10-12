import { requireRole } from "@server/auth";
import { PageHeader } from "@/components/layout/page-header";

export default async function AdminPromotionsPage() {
  await requireRole(["ADMIN"]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการโปรโมชัน"
        subtitle="หน้าจัดการโปรโมชัน (กำลังพัฒนา)"
        breadcrumbs={[
          { label: "แดชบอร์ด", href: "/(admin)/admin" as unknown as import("next").Route<string> },
          { label: "โปรโมชัน" },
        ]}
      />
      <p className="text-muted-foreground">หน้านี้จะรองรับการสร้างโค้ดส่วนลดและการเปิด/ปิดใช้งาน</p>
    </div>
  );
}
