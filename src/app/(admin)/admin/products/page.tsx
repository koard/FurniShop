import { requireRole } from "@server/auth";
import { PageHeader } from "@/components/layout/page-header";

export default async function AdminProductsPage() {
  await requireRole(["ADMIN"]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการสินค้า"
        subtitle="หน้าจัดการสินค้า (กำลังพัฒนา)"
        breadcrumbs={[
          { label: "แดชบอร์ด", href: "/(admin)/admin" as unknown as import("next").Route<string> },
          { label: "สินค้า" },
        ]}
      />
      <p className="text-muted-foreground">หน้านี้จะรองรับการเพิ่ม/แก้ไข/ลบสินค้า และค้นหา/กรอง</p>
    </div>
  );
}
